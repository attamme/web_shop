const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const productAdminRoutes = require('./routes/admin/products');
app.use('/admin', productAdminRoutes);

const productRoutes = require('./routes/products');
app.use(productRoutes);

const sequelize = require('./utils/db');

const models = require('./models/index');
sequelize.models = models;

sequelize
    .sync()
    .then(() => {
        console.log('Tabelid on loodud');
        app.listen(3002)
    })
    .catch(err => {
        console.log(err);
    });

app.get('/', (req, res) => {
    res.json({ message: 'web shop app'})
})