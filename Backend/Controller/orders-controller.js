const Order = require('../Models/order'); // Adjust the path if necessary

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ userId });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders for user', error });
    }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const orders = await Order.find({ status });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found with this status' });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders by status', error });
    }
};

// Create a new order
exports.createOrder = async (req, res) => {
    const { orderId, userId, amount, status, payStatus, items } = req.body;
    try {
        const newOrder = new Order({ orderId, userId, amount, status, payStatus, items });
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(400).json({ message: 'Error creating order', error });
    }
};

// Update an order
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const updates = req.body;
    try {
        const updatedOrder = await Order.findOneAndUpdate({ orderId }, updates, { new: true, runValidators: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(400).json({ message: 'Error updating order', error });
    }
};

// Track an order by ID
exports.trackOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order tracked successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking order', error });
    }
};
