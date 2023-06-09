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
app.use(express.static('js'));

var port = 3000

var port = 3000

app.get('/', (req, res, next) => {
    if (req.session !== null && req.session.loggedin) {
        res.render('products', { "products": req.session.available_products, "cart": req.session.cart }); // send products page html file if person is already logged in
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

    // Check if username already exists
    let sql = `SELECT COUNT(*) as count FROM users WHERE username = '${userdata.username}'`;
    let result = db.prepare(sql).get();

    if (result.count > 0) {
        res.status(400).send('Username already exists');
    } else {
        // Insert user into database
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

        // Load product page upon successful signup
        let sql_get_all_products = `SELECT * FROM products;`;
        let products = db.prepare(sql_get_all_products).all();
        req.session.available_products = products;

        res.render('products', { "products": req.session.available_products, "cart": req.session.cart, "purchase": 'hide' });

        res.end();
    }
    res.end()
});


// Login endpoint
app.post('/api/login/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
    let user = db.prepare(sql).get();

    if (user) {
        // Log interaction
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

        // Load product page upon successful login
        let sql_get_all_products = `SELECT * FROM products;`;
        let products = db.prepare(sql_get_all_products).all();
        req.session.available_products = products;

        res.render('products', { "products": req.session.available_products, "cart": req.session.cart, "purchase": 'hide' });
    } else {
        res.status(401).send('Invalid username or password.');
        
    }
    res.end()
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


// View products endpoint
app.get('/api/products/', (req, res, next) => {
    if (req.session.loggedin) {
        let sql = `SELECT * FROM products;`;
        let products = db.prepare(sql).all();
        res.render('products', { "products": products, "cart": req.session.cart, "purchase": 'hide' });
    } else {
        res.status(200).render('home');
    }
    res.end();
});


// Edit profile endpoint
app.post('/api/update/', (req, res, next) => {
    // Get user data
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        if (req.body.username !== req.session.username) { // Check if username was changed
            let sql = `SELECT COUNT(*) as count FROM users WHERE username = '${req.body.username}'`;
            let result = db.prepare(sql).get();

            if (result.count > 0) {
                res.status(400).send('Username already exists');
                res.end();
                return;
            }
        }

        // Update user data
        let userdata = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username,
            password: user.password,
        }

        let sql = `UPDATE users SET fname = '${userdata.fname}', lname = '${userdata.lname}', username = '${userdata.username}', password = '${userdata.password}' WHERE username = '${req.session.username}';`;
        db.prepare(sql).run();

        // Log interaction
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
    // Get user data
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        let userdata = {
            fname: user.fname,
            lname: user.lname,
            username: user.username,
            password: req.body.new_password,
        }

        if (req.body.password == user.password && req.body.new_password == req.body.confirm_password) { // Check password and confirm password match
            let sql = `UPDATE users SET fname = '${userdata.fname}', lname = '${userdata.lname}', username = '${userdata.username}', password = '${userdata.password}' WHERE username = '${req.session.username}';`;
            db.prepare(sql).run();
            
            // Log interaction
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;

            let id = db.prepare(`SELECT id FROM users WHERE username = '${userdata.username}';`).get().id;

            sql = `INSERT INTO interactions (user_id, date, action) VALUES ('${id}', '${dateTime}', 'changed password');`;
            db.prepare(sql).run();

            res.redirect('/api/account');
        } else if (req.body.confirm_password != req.body.new_password) { // If new password and confirm password don't match
            res.send("Passwords don't match.");
        } else { // If password is incorrect
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});


// Delete account endpoint
app.post('/api/delete_account/', (req, res, next) => {
    // Get user data
    let get_sql = `SELECT username, fname, lname, password FROM users WHERE username = '${req.session.username}';`;
    let user = db.prepare(get_sql).get();

    if (req.session.loggedin) {
        if (req.body.password == user.password) { // Check password
            let sql = `DELETE FROM users WHERE username = '${req.session.username}';`;
            db.prepare(sql).run();

            // Erase session and redirect to home
            req.session.destroy();
            res.redirect('/');
        } else { // If password is incorrect
            res.send('Incorrect password.');
        }
    } else {
        res.status(200).render('home');
    }

    res.end();
});

app.post('/api/products/buy/:id', (req, res, next) => {
    if (req.session.loggedin) {
        //no items in cart
        if (req.session.cart.length < 1) {
            req.session.cart.push({ id: req.body.id, name: req.body.name, quantity: parseInt(req.body.quantity), price: req.body.price });
        } else {
            //increase quantity if the item is already present

            let result = req.session.cart.find((e) => { return e.name === req.body.name });

            if (result == undefined) {
                req.session.cart.push({ id: req.body.id, name: req.body.name, quantity: parseInt(req.body.quantity), price: req.body.price });
            } else { result.quantity += 1; }
        }

        res.render('products', { "products": req.session.available_products, "cart": req.session.cart, "purchase": 'hide' });
        res.end();
    }
    else {
        res.status(200).render('home');
    }
});

app.post('/api/products/remove/:id', (req, res, next) => {
    if (req.session.loggedin) {
        //remove from array if only one of the item
        if (req.body.quantity <= 1) {
            req.session.cart = req.session.cart.filter(function (e) { return e.name !== req.body.name })
        } else {
            let result = req.session.cart.find((e) => { return e.name === req.body.name });

            if (result !== undefined) {
                result.quantity -= 1;
            }
        }

        res.render('products', { "products": req.session.available_products, "cart": req.session.cart, "purchase": 'hide' });
        res.end();
    }

    else {
        res.status(200).render('home');
    }
});

app.post('/api/checkout/', (req, res, next) => {
    res.render('checkout', { "cart": req.session.cart, "total": req.body.total })
    res.end();
});

//confirm purchase
app.post('/api/confirm_purchase', (req, res, next) => {
    //add interaction to checkout table
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    var purchase = 'hide';

    let userID = db.prepare(`SELECT id FROM users WHERE username = '${req.session.username}';`).get().id;
    let checkQ = `INSERT INTO checkouts (user_id, date, cost, email, phone, address) VALUES ('${userID}', '${dateTime}', '${req.body.total}', '${req.body.email}', '${req.body.phone}', '${req.body.address}');`;
    db.prepare(checkQ).run();

    //if we are at this endpoint with an empty cart, it must be due to refreshing
    //only show confirm purchase message if we reach this endpoint with items in cart
    if (req.session.cart.length >= 1) {
        console.log('empty');
        purchase = 'show';
    }

    //decrement quantity of each item in product db
    for (let i = 0; i < req.session.cart.length; i++) {
        let itemId = req.session.cart[i]['id']
        let purchaseQuantity = (req.session.cart[i]['quantity']);
        let oldQuantity = (req.session.available_products[i]['quantity']);
        let newQuantity = oldQuantity - purchaseQuantity

        let decrQ = `UPDATE products SET quantity = ${newQuantity} WHERE id='${itemId}';`;
        db.prepare(decrQ).run();
    }
    //clear cart
    let sql_get_all_products = `SELECT * FROM products;`;
    let products = db.prepare(sql_get_all_products).all();
    let trans_id = db.prepare(`SELECT id, date FROM checkouts WHERE user_id='${userID}' ORDER BY date DESC LIMIT 1;`).all();
    req.session.available_products = products;

    req.session.cart = [];

    //return home
    res.render('products', { "products": req.session.available_products, "cart": req.session.cart, "purchase": purchase, "trans_id": trans_id[0].id });

    res.end();
});


// Logout endpoint
app.get('/api/logout/', (req, res, next) => {
    req.session.destroy()
    res.redirect("/");
});


app.listen(port, () => {
    console.log("Server listening on port 3000")
})
