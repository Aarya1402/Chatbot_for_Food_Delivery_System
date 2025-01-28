const express = require('express');
const router = express.Router();
const Order = require('../Models/order'); // Order model
const Menu = require('../Models/menu');   // Menu model
const User = require('../Models/user');   // User model

// Store in-progress orders temporarily (mimicking session behavior)
let inProgressOrders = {};

// Handle chatbot requests
router.post('/', async (req, res) => {
    console.log("Webhook request arrived");
    const payload = req.body;
    const intent = payload.queryResult.intent.displayName;
    const parameters = payload.queryResult.parameters;
    const sessionId = extractSessionId(payload.queryResult.outputContexts[0].name);

    const intentHandlers = {
        'new.order - context: ongoing-order': newOrder, // Add new.order intent handler
        'order.add - context: ongoing-order': addToOrder,
        'order.remove - context: ongoing-order': removeFromOrder,
        'order.complete - context: ongoing-order': completeOrder,
        'track.order - context: ongoing-tracking': trackOrder,
    };

    if (intentHandlers[intent]) {
        return await intentHandlers[intent](parameters, sessionId, res);
    } else {
        res.json({ fulfillmentText: 'Intent not recognized. Please try again.' });
    }
});

// Extract session ID from the context
function extractSessionId(contextName) {
    const sessionMatch = contextName.match(/\/sessions\/(.*?)\/contexts\//);
    return sessionMatch ? sessionMatch[1] : null;
}

// Helper function to save order to the database
async function saveToDb(order) {
    try {
        const newOrder = new Order({
            userId: order.userId,
            items: order.items,
            amount: order.totalAmount,
            status: 'Pending',
            payStatus: 'Unpaid',
        });

        const savedOrder = await newOrder.save();
        return savedOrder;
    } catch (err) {
        console.error('Error saving order:', err);
        return null;
    }
}

// Handle "new.order" intent
async function newOrder(parameters, sessionId, res) {
    // Initialize a new order for the session
    inProgressOrders[sessionId] = {};

    res.json({ fulfillmentText: 'A new order has been started. What would you like to add?' });
}

// Handle "add to order" intent
async function addToOrder(parameters, sessionId, res) {
    const foodItems = parameters['food-item'];
    const quantities = parameters['number'];

    if (foodItems.length !== quantities.length) {
        return res.json({ fulfillmentText: 'Please specify food items and quantities clearly.' });
    }

    const foodDict = foodItems.reduce((acc, item, idx) => {
        acc[item] = quantities[idx];
        return acc;
    }, {});

    if (inProgressOrders[sessionId]) {
        Object.assign(inProgressOrders[sessionId], foodDict);
    } else {
        inProgressOrders[sessionId] = foodDict;
    }

    const orderSummary = Object.entries(inProgressOrders[sessionId])
        .map(([item, qty]) => `${qty} ${item}`)
        .join(', ');

    res.json({ fulfillmentText: `So far you have: ${orderSummary}. Do you need anything else?` });
}

// Handle "remove from order" intent
async function removeFromOrder(parameters, sessionId, res) {
    const foodItems = parameters['food-item'];

    if (!inProgressOrders[sessionId]) {
        return res.json({ fulfillmentText: 'No order found. Please place a new order.' });
    }

    const currentOrder = inProgressOrders[sessionId];
    let removedItems = [];
    let notFoundItems = [];

    foodItems.forEach(item => {
        if (currentOrder[item]) {
            removedItems.push(item);
            delete currentOrder[item];
        } else {
            notFoundItems.push(item);
        }
    });

    let responseText = '';
    if (removedItems.length) {
        responseText += `Removed ${removedItems.join(', ')} from your order. `;
    }
    if (notFoundItems.length) {
        responseText += `These items were not in your order: ${notFoundItems.join(', ')}. `;
    }
    if (Object.keys(currentOrder).length === 0) {
        responseText += 'Your order is now empty.';
    } else {
        const remainingOrder = Object.entries(currentOrder)
            .map(([item, qty]) => `${qty} ${item}`)
            .join(', ');
        responseText += `Current order: ${remainingOrder}.`;
    }

    res.json({ fulfillmentText: responseText });
}

// Handle "complete order" intent
async function completeOrder(parameters, sessionId, res) {
    if (!inProgressOrders[sessionId]) {
        return res.json({ fulfillmentText: 'No order found. Please place a new order.' });
    }

    const order = inProgressOrders[sessionId];
    const items = await Promise.all(Object.entries(order).map(async ([itemName, qty]) => {
        const menuItem = await Menu.findOne({ name: itemName });
        if (!menuItem) return null;
        return { itemId: menuItem._id, qty, total: qty * menuItem.price };
    }));

    if (items.includes(null)) {
        return res.json({ fulfillmentText: 'One or more items could not be processed. Please try again.' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const savedOrder = await saveToDb({ items, totalAmount });

    if (!savedOrder) {
        return res.json({ fulfillmentText: 'An error occurred while placing your order. Please try again.' });
    }

    delete inProgressOrders[sessionId];
    res.json({
        fulfillmentText: `Your order has been placed! Order ID: ${savedOrder._id}, Total: $${totalAmount}.`,
    });
}

// Handle "track order" intent
async function trackOrder(parameters, sessionId, res) {
    const orderId = parameters['order_id'];

    const order = await Order.findById(orderId);
    if (!order) {
        return res.json({ fulfillmentText: `No order found with ID: ${orderId}` });
    }

    res.json({
        fulfillmentText: `Order status for ID ${orderId}: ${order.status}.`,
    });
}

module.exports = router;