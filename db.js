import database from 'better-sqlite3';

const db = new database('RetailExperience.db');

const users_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='users';`);

const users = users_db.get();

if (users === undefined) {
    try {
        db.prepare(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            fname TEXT, 
            lname TEXT, 
            username TEXT, 
            password TEXT);`).run();
        
        db.prepare(`INSERT INTO users (fname, lname, username, password) VALUES ('admin_fname', 'admin_lname', 'admin', 'admin_pass');`).run();

    } catch (error) {
        console.log(error);
    }
}
else {
    console.log('User info table exists.');
}

const products_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='products';`);

const products = products_db.get();

if (products === undefined) {
    try {
        db.prepare(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT, 
            price INTEGER,
            quantity INTEGER);`).run();

        db.prepare(`INSERT INTO products (name, price, quantity) VALUES ('product1', 100, 10), ('product2', 200, 5), ('product1', 30, 0);`).run();

    } catch (error) {
        console.log(error);
    }
}
else {
    console.log('Products info table exists.');
}

const interations_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='interactions';`);

const interactions = interations_db.get();

if (interactions === undefined) {
    try {
        db.prepare(`CREATE TABLE interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            user_id INTEGER,
            date DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id));`).run();
        
        db.prepare(`INSERT INTO interactions (user_id, date) VALUES (1, '2023-04-18 00:00:00');`).run();

    } catch (error) {
        console.log(error);
    }
}
else {
    console.log('Interactions info table exists.');
}

const checkouts_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='checkouts';`);

const checkouts = checkouts_db.get();

if (checkouts === undefined) {
    try {
        db.prepare(`CREATE TABLE checkouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date DATETIME,
            cost INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id));`).run();

        db.prepare(`INSERT INTO checkouts (user_id, date, cost) VALUES (1, '2023-04-18 00:00:00', 100);`).run();

    } catch (error) {
        console.log(error);
    }
}
else {
    console.log('Checkouts info table exists.');
}

export default db;