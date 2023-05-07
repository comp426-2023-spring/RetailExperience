import database from 'better-sqlite3';

const db = new database('RetailExperience.db');

const users_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='users';`);
db.prepare(`PRAGMA foreign_keys = ON;`).run();

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

const products_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='products';`);

const products = products_db.get();

if (products === undefined) {
    try {
        db.prepare(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT, 
            price REAL,
            quantity INTEGER);`).run();

        db.prepare(`INSERT INTO products (name, price, quantity) VALUES ('Hat', 20, 25);`).run();
        db.prepare(`INSERT INTO products (name, price, quantity) VALUES ('Shirt', 20, 50);`).run();
        db.prepare(`INSERT INTO products (name, price, quantity) VALUES ('Hoodie', 50, 40);`).run();
        db.prepare(`INSERT INTO products (name, price, quantity) VALUES ('Socks', 10, 15);`).run();

    } catch (error) {
        console.log(error);
    }
}

const interations_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='interactions';`);

const interactions = interations_db.get();

if (interactions === undefined) {
    try {
        db.prepare(`CREATE TABLE interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            user_id INTEGER,
            date DATETIME,
            action TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`).run();
        
        db.prepare(`INSERT INTO interactions (user_id, date, action) VALUES (1, '2023-04-18 00:00:00', 'created account');`).run();

    } catch (error) {
        console.log(error);
    }
}

const checkouts_db = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='checkouts';`);

const checkouts = checkouts_db.get();

if (checkouts === undefined) {
    try {
        db.prepare(`CREATE TABLE checkouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date DATETIME,
            cost REAL,
            email TEXT,
            phone decimal(10,0),
            address TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`).run();

        db.prepare(`INSERT INTO checkouts (user_id, date, cost, email, phone, address) VALUES (1, '2023-04-18 00:00:00', 100, 'test@gmail.com', 1111111111, 'Test Address');`).run();

    } catch (error) {
        console.log(error);
    }
}

export default db;