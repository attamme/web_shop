const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

router.get('/cart', (req, res) => {
    shopController.getCart(req, res);
});

router.post('/cart/add', (req, res) => {
    shopController.addToCart(req, res);
})

router.post('/cart/remove', (req, res) => {
    shopController.removeFromCart(req, res);
})

router.post('/cart/order', (req, res) => {
    shopController.OrderItems(req, res);
});

router.get('/cart/vieworders', (req, res) => {
    shopController.viewOrderedItems(req, res);
});

module.exports = router;