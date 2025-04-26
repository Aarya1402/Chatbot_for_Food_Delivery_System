const express = require('express');
const router = express.Router();
const orderController = require('../Controller/orders-controller'); // Adjust the path as needed

// Get all orders
router.get('/', orderController.getAllOrders);

// Get orders by user ID
router.get('/user/:userId', orderController.getOrdersByUserId);

// Get orders by status
router.get('/status/:status', orderController.getOrdersByStatus);

// Create a new order
router.post('/', orderController.createOrder);

// Update an order
router.put('/:orderId', orderController.updateOrder);
router.put('/:orderId/status', orderController.updateOrderStatus);


// Track an order by ID
router.get('/:orderId/track', orderController.trackOrder);

module.exports = router;
