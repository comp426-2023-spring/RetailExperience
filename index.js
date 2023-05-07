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
app.use(express.static('js'));

var port = 3000

var result = db.prepare(`SELECT COUNT(id) AS count FROM products`).get();
var productsNumber = result.count;

app.get('/', (req, res, next) => {
    
    if (!req.session.cart) {req.session.cart = [];}
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
        console.log('Logged in.');

        console.log('User created.');
        res.render('products')
        //res.redirect('/api/products/');
    }
    res.end()
});

app.post('/api/login/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
    let user = db.prepare(sql).get();

    if (user) {
        req.session.loggedin = true;
        req.session.username = username;
        res.render('products')
        //res.redirect('/api/products/');
    } else {
        res.status(401).send('Invalid username or password.');
        
    }
    res.end()
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

//load items and display in html
function loadProducts() {

    var item_html = "";
    var cont = document.getElementsByClassName('row')

    for(var i = 0; i < 10; i++) {
        item_html = '<div class="col-6 pt-4">' + '<div class="border border-1 border-dark rounded p-2">' + '<img class="pt-3" src="img/hat.jpg" alt="white cap">' + '<p class="text-center pt-2 fs-4">A</p>' + '<div class="row">' + '<div class="col-7">' + '<p class="text-center fs-5">B</p>' + '</div>' + '<div class="col-5">' + '<button type="button" class="btn btn-outline-success">Buy</button>' + '</div>' + '</div>' + '</div>' + '</div>';

        $(".container" ).append( item_html );
        
    }
}

//renders products page
app.get('/api/products/', (req, res, next) => {
    
    let sql = `SELECT * FROM Products;`;
    let all_products = db.prepare(sql).get();
    let productCount = db.prepare(`SELECT COUNT(*) as count FROM Products;`).get();
    var count = productCount.count



    console.log(all_products)
    console.log(count)
    console.log(all_products.name)
    console.log(all_products.price)
    console.log(all_products.quantity)

    
    res.render('products', {"products" : all_products, "productCount" : count, "cart" : req.session.cart});   
    res.end();
});

//add product to cart 
app.post('/api/add_cart/:p', (req, res, next) => {
    let product_add = db.prepare(`SELECT id, name, price FROM Products WHERE id='${p}';`).get();
    req.session.cart.push(product_add)

    console.log(product_add)
    console.log(req.session.cart[0])    
    
    res.end();
});

//remove product from cart
app.post('/api/remove_product/:p', (req, res, next) => {
    var product_remove = 
    
    if (req.session.cart[p] != null) {
        let product_remove = db.prepare(`SELECT id, name, price FROM Products WHERE id='${p}';`).get();
        req.session.cart.remove(product_remove)

    }

    
    console.log(product_add)
    console.log(req.session.cart[0])    
    
    res.end();

});

//go to cart page
app.post('/api/cart/', (req, res, next) => {
    let products = db.prepare(`SELECT name, price, quantity FROM Products;`).get();

    
    res.render('cart');
    res.end();
});

//go to checkout page from cart
app.post('/api/checkout', (req, res, next) => {
    let products = db.prepare(`SELECT name, price, quantity FROM Products;`).get();

    res.render('checkout');
    res.end();
});

//confirm purchase
app.post('/api/confirm_purchase', (req, res, next) => {
    //add interaction to checkout table
    let get_sql = `SELECT name, price, quantity FROM Products`;
    let products = db.prepare(get_sql).get();

    //decrement quantity of each item in product db
    

    //clear cart
    req.session.products = {};

    //return home
    res.render('home');
    //display confirm message


    res.end();
});


app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
    console.log(`Number of products: ${productsNumber}`);
})
