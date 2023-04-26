import db from './db.js';
import express from 'express';
import session from 'express-session';

const app = express()
app.set('views', './templates');
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var port = 5005

app.get('/', (req, res, next) => {
    res.status(200).render('home') // send login page html file
})

// Create user endpoint
app.post('/api/profile/', (req, res, next) => {
    let userdata = {
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username,
        password: req.body.password
    }

    let sql = `SELECT COUNT(*) as count FROM users WHERE username = '${userdata.username}'`;
    let result = db.prepare(sql).get();

    if (result.count > 0) {
        res.status(400).send('Username already exists');
    } else {
        sql = `INSERT INTO users(fname, lname, username, password) VALUES('${userdata.fname}', '${userdata.lname}', '${userdata.username}', '${userdata.password}');`;
        db.prepare(sql).run();

        req.session.loggedin = true;
        req.session.username = userdata.username;
        req.session.products = {};
        res.render('products');
        console.log('Logged in.');

        console.log('User created.');
        res.end();
    }
});

app.post('/api/login/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
    let user = db.prepare(sql).get();

    if (user) {
        req.session.loggedin = true;
        req.session.username = username;
        req.session.products = {};
        res.render('products');
    } else {
        res.status(401).send('Invalid username or password.');
    }
    res.end();
});

app.get('/api/account/', (req, res, next) => {
    if (req.session.loggedin) {
        let sql = `SELECT username, fname, lname FROM users WHERE username = '${req.session.username}';`;
        let user = db.prepare(sql).get();
        res.render('account', 
            {"username": user.username, "fname": user.fname, "lname": user.lname}
        );
        console.log('Account page rendered.');
    } else {
        res.status(200).render('home');
    }
    res.end();
});

app.post('/api/update/', (req, res, next) => {
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        let userdata = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username,
            password: user.password,
        }
        let sql = `UPDATE users SET fname = '${userdata.fname}', lname = '${userdata.lname}', username = '${userdata.username}', password = '${userdata.password}' WHERE username = '${req.session.username}';`;
        db.prepare(sql).run();

        req.session.username = userdata.username;

        res.send('User updated.');
    } else {
        res.status(200).render('home');
    }
    res.end();
});

app.post('/api/update_password/', (req, res, next) => {
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        let userdata = {
            fname: user.fname,
            lname: user.lname,
            username: user.username,
            password: req.body.new_password,
        }

        if (req.body.password == user.password) {
            let sql = `UPDATE users SET fname = '${userdata.fname}', lname = '${userdata.lname}', username = '${userdata.username}', password = '${userdata.password}' WHERE username = '${req.session.username}';`;
            db.prepare(sql).run();
            res.send('Password updated.');
        } else {
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});

app.post('/api/delete_account/', (req, res, next) => {
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        if (req.body.password == user.password) {
            let sql = `DELETE FROM users WHERE username = '${req.session.username}';`;
            db.prepare(sql).run();

            req.session.loggedin = false;
            req.session.username = null;
            req.session.products = null;
        } else {
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});
    
app.listen(port, () => {
    console.log("Server listening on port 5005")
})
