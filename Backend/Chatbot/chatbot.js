const express = require('express');
const axios = require('axios');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../Models/order'); // Adjust path as needed
const Menu = require('../Models/menu'); // Menu model

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

    // Fetch the current menu items from the database
    let menuItems;
    try {
        const response = await fetch('https://chatbot-for-food-delivery-system.onrender.com/menu/');
        menuItems = await response.json();
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.json({ fulfillmentText: 'Sorry, I am unable to access the menu at the moment. Please try again later.' });
    }

    const availableItems = {};
    const unavailableItems = [];

    // Check each requested item against the menu
    for (const [item, qty] of Object.entries(foodDict)) {
        const menuItem = menuItems.find(menuItem => menuItem.name.toLowerCase() === item.toLowerCase());
        if (menuItem) {
            availableItems[item] = qty;
        } else {
            unavailableItems.push(item);
        }
    }

    // Update the in-progress order
    if (inProgressOrders[sessionId]) {
        Object.assign(inProgressOrders[sessionId], availableItems);
    } else {
        inProgressOrders[sessionId] = availableItems;
    }

    // Construct the response message
    let responseText = '';

    if (Object.keys(availableItems).length > 0) {
        const orderSummary = Object.entries(inProgressOrders[sessionId])
            .map(([item, qty]) => `${qty} ${item}`)
            .join(', ');
        responseText += `So far you have: ${orderSummary}. `;
    }

    if (unavailableItems.length > 0) {
        responseText += `However, the following items are not available in our menu: ${unavailableItems.join(', ')}. `;
    }

    responseText += 'Do you need anything else?';

    res.json({ fulfillmentText: responseText });
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

    try {
        // Calculate total amount and prepare items
        const items = await Promise.all(
            Object.entries(order).map(async ([itemName, qty]) => {
                const menuItem = await Menu.findOne({ name: itemName });
                if (!menuItem) {
                    throw new Error(`Item '${itemName}' not found in menu.`);
                }
                return {
                    itemId: menuItem._id,
                    qty,
                    total: qty * menuItem.price,
                };
            })
        );

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

        // Prepare order details
        const newOrder = new Order({
            orderId: new mongoose.Types.ObjectId().toString(), // Generate unique order ID
            userId: parameters['user_id'], // Pass user ID from intent parameters
            amount: totalAmount,
            items,
        });

        // Save order to the database
        const savedOrder = await newOrder.save();

        // Clear in-progress order for the session
        delete inProgressOrders[sessionId];

        res.json({
            fulfillmentText: `Order placed successfully! Order ID: ${savedOrder.orderId}, Total: $${totalAmount}.`,
        });
    } catch (error) {
        console.error('Error completing order:', error.message);
        res.json({ fulfillmentText: 'An error occurred while placing your order. Please try again.' });
    }
}


// Handle "track order" intent
async function trackOrder(parameters, sessionId, res) {
    const orderId = parameters['order_id'];
    console.log('Tracking order:', orderId);
    try {
        const response = await axios.get(`${API_BASE_URL}/${orderId}/track`); // Call Track Order API
        console.log('Order status:', response);
        console.log('Order status:', response.status);
        res.json({ fulfillmentText: `Order status: ${response.data.order.status}.` });
    } catch (error) {
        console.error('Error tracking order:', error.message);
        res.json({ fulfillmentText: `Could not track order with ID ${orderId}. Please try again.` });
    }
}

module.exports = router;
