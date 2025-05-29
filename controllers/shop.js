const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');
const product = require('../models/product');
const CartItem = require('../models/cart-item');
const Order = require('../models/order');
const OrderItems = require('../models/order-items');

class shopController {

    async getAllProducts(req, res) {
        const products = await Product.findAll();
        console
        res.status(201).json({
            message: 'Products fetched successfully',
            products: products
        });
    }

    async getCart(req, res) {
        const userCart = await req.user.getCart();
        console.log(userCart);
        const cartProducts = await userCart.getProducts(); 
        res.status(201).json({
            message: 'Cart fetched successfully',
            products: cartProducts
        });
    }

    async addToCart(req, res) {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ error: "No Product ID or quantity" });
        }
        console.log("Received productId:", productId);
        console.log("Received quantity:", quantity);

        const userCart = await req.user.getCart();

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        const cartItem = await userCart.findOne({
            where: { cartId: userCart.id, productId: productId }
        });

        if (cartItem) {
            cartItem.quantity = Number(cartItem.quantity) + Number(quantity);
            await cartItem.save();
            return res.status(200).json({
                message: "Cart updated",
                cartItem
            });
        } else {
            const newCartItem = await userCart.addProduct(product, {
                through: { quantity: quantity },
            });
        
            return res.status(201).json({ 
                message: "Product added to cart", 
                cartItem: newCartItem 
            });
        }
    }

    async removeFromCart(req, res) {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "No Product ID provided" });
        }

        const userCart = await req.user.getCart();

        if (!userCart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const cartProducts = await userCart.getProducts({
            where: { id: productId },
        });

        if (cartProducts.length > 0) {
            await userCart.removeProduct(cartProducts[0]);
            return res.status(200).json({
                message: 'Product removed from cart',
                productId
            });
        } else {
            return res.status(404).json({ error: "Product not in cart" });
        }
    }

    async OrderItems(req, res) {
        const userId = req.user.id;
        const userCart = await req.user.getCart();
        const cartItems = await userCart.getProducts({
            attributes: ['id'],
            through: { attributes: ['quantity'] }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderItems = cartItems.map((cartItem) => {
            return {
                productId: cartItem.id,
                quantity: cartItem.CartItem ? cartItem.CartItem.quantity : 0
            };
        })

        const newOrder = await Order.create({
            userId
        });

        for (const item of orderItems) {
            await OrderItems.create({
                orderId: newOrder.id,
                ...item
            });
        }

        res.status(201).json({
            message: 'Order created',
            newOrder
        });
    }

    async viewOrderedItems(req, res) {
        const userId = req.user.id;
        const orderedItems = await Order.findAll({
            where: { userId },
            include: [{
                model: OrderItems,
                as: 'orderItems',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'title']
                }]
            }]
        }); 

        res.status(201).json({
            orders: orderedItems
        });
    }
}

module.exports = new shopController();