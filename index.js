import db from './db.js';
import express from 'express';
import session from 'express-session';

const app = express()
app.set('views', './templates');
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var port = 5005

app.get('/', (req, res, next) => {
    if (req.session !== null && req.session.loggedin) {
        res.render('products', { "products": req.session.available_products }); // send products page html file if person is already logged in
    } else {
        res.status(200).render('home') // send login page html file
    }
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

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        let id = db.prepare(`SELECT id FROM users WHERE username = '${userdata.username}';`).get().id;

        sql = `INSERT INTO interactions (user_id, date, action) VALUES ('${id}', '${dateTime}', 'created account');`;
        db.prepare(sql).run();

        req.session.loggedin = true;
        req.session.username = userdata.username;
        req.session.available_products = [];
        req.session.cart = [];

        let sql_get_all_products = `SELECT * FROM products;`;
        let products = db.prepare(sql_get_all_products).all();
        req.session.available_products = products;

        res.render('products', { "products": req.session.available_products });

        res.end();
    }
});


// Login endpoint
app.post('/api/login/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
    let user = db.prepare(sql).get();

    if (user) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        let id = db.prepare(`SELECT id FROM users WHERE username = '${username}';`).get().id;

        sql = `INSERT INTO interactions (user_id, date, action) VALUES ('${id}', '${dateTime}', 'logged in');`;
        db.prepare(sql).run();

        req.session.loggedin = true;
        req.session.username = username;
        req.session.available_products = [];
        req.session.cart = [];

        let sql_get_all_products = `SELECT * FROM products;`;
        let products = db.prepare(sql_get_all_products).all();
        req.session.available_products = products;

        res.render('products', { "products": req.session.available_products });
    } else {
        res.status(401).send('Invalid username or password.');
    }
    res.end();
});


// View account details endpoint
app.get('/api/account/', (req, res, next) => {
    if (req.session.loggedin) {
        let sql = `SELECT username, fname, lname FROM users WHERE username = '${req.session.username}';`;
        let user = db.prepare(sql).get();
        res.render('account', 
            {"username": user.username, "fname": user.fname, "lname": user.lname}
        );
    } else {
        res.status(200).render('home');
    }
    res.end();
});


// Edit profile endpoint
app.post('/api/update/', (req, res, next) => {
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        if (req.body.username !== req.session.username) {
            let sql = `SELECT COUNT(*) as count FROM users WHERE username = '${req.body.username}'`;
            let result = db.prepare(sql).get();

            if (result.count > 0) {
                res.status(400).send('Username already exists');
                res.end();
                return;
            }
        }

        let userdata = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username,
            password: user.password,
        }

        let sql = `UPDATE users SET fname = '${userdata.fname}', lname = '${userdata.lname}', username = '${userdata.username}', password = '${userdata.password}' WHERE username = '${req.session.username}';`;
        db.prepare(sql).run();

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        let id = db.prepare(`SELECT id FROM users WHERE username = '${userdata.username}';`).get().id;

        sql = `INSERT INTO interactions (user_id, date, action) VALUES ('${id}', '${dateTime}', 'updated account');`;
        db.prepare(sql).run();

        req.session.username = userdata.username;

        res.redirect('/api/account');
    } else {
        res.status(200).render('home');
    }
    res.end();
});


// update password endpoint
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
            
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;

            let id = db.prepare(`SELECT id FROM users WHERE username = '${userdata.username}';`).get().id;

            sql = `INSERT INTO interactions (user_id, date, action) VALUES ('${id}', '${dateTime}', 'changed password');`;
            db.prepare(sql).run();

            res.redirect('/api/account');
        } else {
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});


// Delete account endpoint
app.post('/api/delete_account/', (req, res, next) => {
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        if (req.body.password == user.password) {
            let sql = `DELETE FROM users WHERE username = '${req.session.username}';`;
            db.prepare(sql).run();

            req.session.destroy();
            res.redirect('/');
        } else {
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});

app.post('/api/buy/', (req, res, next) => {
    if (req.session.loggedin) {
        for (let i = 0; i < req.session.cart.length; i++) {
            if (req.session.cart[i].id == req.body.id) {
                req.session.cart[i].quantity = req.body.quantity;
                res.render('products', { "products": req.session.available_products });
                res.end();
                return;
            }
        }

        req.session.cart.push({id: req.body.id, name:req.body.name, quantity: req.body.quantity, price: req.body.price});
        res.render('products', { "products": req.session.available_products });
    }
    else {
        res.status(200).render('home');
    }
});

app.get('/api/logout/', (req, res, next) => {
    req.session.destroy()
    res.redirect("/");
});
    
app.listen(port, () => {
    console.log("Server listening on port 5005")
})