import db from './db.js';
import express from 'express';
import path from 'path';

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var port = 5005

app.get('/', (req, res, next) => {
    res.status(200).sendFile(path.resolve('./templates/home.html')) // send login page html file
})

// Create user endpoint
app.post('/api/profile/', (req, res, next) => {
    let userdata = {
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username,
        password: req.body.password
    }
    let sql = `INSERT INTO users (fname, lname, username, password) VALUES ('${userdata.fname}', '${userdata.lname}', '${userdata.username}', '${userdata.password}');`;
    db.prepare(sql).run();
    res.send('User created.');
    console.log('User created.');
});

app.listen(port, () => {
    console.log("Server listening on port 5005")
})