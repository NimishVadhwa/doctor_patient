const express = require('express');
const app = express();
const db = require('./src/database');
require('dotenv').config()
const port = process.env.PORT || 7100;
const cors = require('cors');
// const route = require('./src/routes');
const { send_msg } = require('./src/helper');

app.use(express.json());
app.use(cors());
app.use("/assets/images", express.static("assets/images"));

// app.use('/api', route);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
    next();
})

//error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ status: false, message: err.message });
});

db
    .sync()
    .then((result) => {
        const server = app.listen(port);

        console.log('Db connected===', port);
    }).catch((err) => {
        console.log('db not connected');
        console.log(err);
    });

