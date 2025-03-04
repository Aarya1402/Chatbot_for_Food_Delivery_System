const { v4: uuidv4 } = require('uuid'); // For generating unique order IDs
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
    const { userId, amount, status, payStatus, items } = req.body;

    try {
        // Generate a unique order ID
        const orderId = uuidv4(); // Generates a UUID (e.g., "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed")

        // Create a new order instance
        const newOrder = new Order({
            orderId, // Add the generated order ID
            userId,
            amount,
            status: status || 'Pending', // Default status is 'Pending'
            payStatus: payStatus || 'Unpaid', // Default payStatus is 'Unpaid'
            items,
        });

        // Save the order to the database
        await newOrder.save();

        // Respond with success message and the created order
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        // Handle errors
        console.error('Error creating order:', error);
        res.status(400).json({ message: 'Error creating order', error: error.message });
    }
};

// Update an order
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { items } = req.body; // Expecting an array of items with quantity changes

    try {
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Convert current order items to a Map for easy quantity updates
        const itemMap = new Map(order.items.map(item => [item.name, item.quantity]));

        items.forEach(({ name, quantity }) => {
            if (itemMap.has(name)) {
                let newQuantity = itemMap.get(name) + quantity;
                if (newQuantity > 0) {
                    itemMap.set(name, newQuantity);
                } else {
                    itemMap.delete(name); // Remove item if quantity reaches 0
                }
            } else if (quantity > 0) {
                itemMap.set(name, quantity);
            }
        });

        // Convert updated map back to array
        order.items = Array.from(itemMap, ([name, quantity]) => ({ name, quantity }));

        const updatedOrder = await order.save();

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
