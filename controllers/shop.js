const Product = require('../models/product');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');

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

        const cartProducts = await userCart.getProducts({
            where: { id: productId },
            joinTableAttributes: ['quantity'] // Include quantity from the join table
        });
        console.log("Cart product raw:", JSON.stringify(cartProducts, null, 2))
        if (cartProducts.length > 0) {
            const existingProduct = cartProducts[0];
            const currentQuantity = existingProduct.CartItem?.quantity || 0
            const newQuantity = currentQuantity + Number(quantity);

            await CartItem.update(
                { quantity: newQuantity },
                {
                    where: {
                    cartId: userCart.id,
                    productId: productId
                    }
                }
            );

            return res.status(200).json({
                message: "Product quantity updated in cart",
                productId,
                quantity: newQuantity
            });

        } else {
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
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
        const productId = req.body.productId;
        const userCart = await req.user.getCart();
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await userCart.removeProduct(product);
        res.status(200).json({
            message: 'Product removed from cart successfully',
            productId: productId
        });
    }

}

module.exports = new shopController();