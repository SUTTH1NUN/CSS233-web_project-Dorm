//server.js

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

pool.connect((err, client, release) => {
    if(err){
        return console.error("Error acquiring client", err.stack);
    }
    console.log("Successfully connect to PostgreSQL Database");

    release();
});

app.get('/', (req, res) => {
    res.status(200).send("Express Backend is running and connect to DB");
});

app.listen(port, () => {
    console.log("Express Backend listening at 127.0.0.1: ", port);
});