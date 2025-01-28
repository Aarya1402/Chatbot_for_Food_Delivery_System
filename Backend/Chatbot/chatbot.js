const express = require('express');
const axios = require('axios'); // For making API calls
const router = express.Router();

// Store in-progress orders temporarily (mimicking session behavior)
let inProgressOrders = {};

// Helper API URLs
const API_BASE_URL = 'https://chatbot-for-food-delivery-system.onrender.com/orders'; // Update this URL based on your backend

// Handle chatbot requests
router.post('/', async (req, res) => {
    console.log("Webhook request arrived");
    const payload = req.body;
    const intent = payload.queryResult.intent.displayName;
    const parameters = payload.queryResult.parameters;
    const sessionId = extractSessionId(payload.queryResult.outputContexts[0].name);

    const intentHandlers = {
        'new.order': newOrder,
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

// Handle "new.order" intent
async function newOrder(parameters, sessionId, res) {
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
    foodItems.forEach(item => delete currentOrder[item]);

    const orderSummary = Object.entries(currentOrder)
        .map(([item, qty]) => `${qty} ${item}`)
        .join(', ');

    res.json({
        fulfillmentText: orderSummary
            ? `Updated order: ${orderSummary}.`
            : 'Your order is now empty.',
    });
}

// Handle "complete order" intent
async function completeOrder(parameters, sessionId, res) {
    if (!inProgressOrders[sessionId]) {
        return res.json({ fulfillmentText: 'No order found. Please place a new order.' });
    }

    const order = inProgressOrders[sessionId];
    const orderDetails = {
        userId: parameters['user_id'], // Pass user ID from intent parameters
        items: Object.entries(order).map(([name, qty]) => ({ name, qty })),
    };

    try {
        const response = await axios.post(API_BASE_URL, orderDetails); // Call Create Order API
        delete inProgressOrders[sessionId];
        res.json({
            fulfillmentText: `Order placed successfully! Order ID: ${response.data._id}.`,
        });
    } catch (error) {
        console.error('Error completing order:', error.message);
        res.json({ fulfillmentText: 'An error occurred while placing your order. Please try again.' });
    }
}

// Handle "track order" intent
async function trackOrder(parameters, sessionId, res) {
    const orderId = parameters['order_id'];

    try {
        const response = await axios.get(`${API_BASE_URL}/${orderId}/track`); // Call Track Order API
        res.json({ fulfillmentText: `Order status: ${response.data.status}.` });
    } catch (error) {
        console.error('Error tracking order:', error.message);
        res.json({ fulfillmentText: `Could not track order with ID ${orderId}. Please try again.` });
    }
}

module.exports = router;
