const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = require('./utils/db');

sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

app.get('/', (req, res) => {
    res.json({ message: 'web shop app'})
})

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});