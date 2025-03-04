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
const fetch = require('node-fetch'); // Ensure fetch is available

// Handle "add to order" intent
async function addToOrder(parameters, sessionId, res) {
    const foodItems = parameters['food-item'].map(item => item.toLowerCase());
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

    // Extract available item names from the menu
    const availableMenuItems = menuItems.map(item => item.name.toLowerCase());

    const availableItems = {};
    const unavailableItems = [];

    // Check each requested item against the menu
    for (const [item, qty] of Object.entries(foodDict)) {
        if (availableMenuItems.includes(item)) {
            availableItems[item] = qty;
        } else {
            unavailableItems.push(item);
        }
    }

    // Update the in-progress order
    if (!inProgressOrders[sessionId]) {
        inProgressOrders[sessionId] = {};
    }
    Object.assign(inProgressOrders[sessionId], availableItems);

    // Construct the response message
    let responseText = '';

    if (Object.keys(availableItems).length > 0) {
        const orderSummary = Object.entries(inProgressOrders[sessionId])
            .map(([item, qty]) => `${qty} ${item}`)
            .join(', ');
        responseText += `So far you have: ${orderSummary}. `;
    }

    if (unavailableItems.length > 0) {
        responseText += `However, the following items are not available on our menu: ${unavailableItems.join(', ')}. `;
    }

    responseText += 'Would you like to add anything else to your order?';

    res.json({ fulfillmentText: responseText });
}


async function removeFromOrder(parameters, sessionId, res) {
    // Extract items and quantities to remove
    let foodItems = parameters['food-item'];
    let quantities = parameters['qty']; // Ensure this parameter is captured in Dialogflow

    // Normalize input to arrays
    if (!Array.isArray(foodItems)) foodItems = [foodItems];
    if (!Array.isArray(quantities)) quantities = [quantities];

    // Default to removing 1 if quantity not specified
    foodItems = foodItems.map(item => item.trim().toLowerCase());
    quantities = quantities.map(qty => Math.abs(parseInt(qty)) || 1);

    if (!inProgressOrders[sessionId]) {
        return res.json({ fulfillmentText: 'No order found. Please place a new order.' });
    }

    const currentOrder = inProgressOrders[sessionId];

    // Process each item with its quantity
    foodItems.forEach((item, index) => {
        const qtyToRemove = quantities[index] || 1;
        if (currentOrder[item] && currentOrder[item] > 0) {
            currentOrder[item] -= qtyToRemove;
            if (currentOrder[item] <= 0) {
                delete currentOrder[item];
            }
        }
    });

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
    const order = inProgressOrders[sessionId];

    if (!order || Object.keys(order).length === 0) {
        return res.json({
            fulfillmentText: 'Your cart is empty. Please add items before completing the order.'
        });
    }

    try {
        // Fetch all menu items and create a map for quick lookup
        const menuItems = await Menu.find({}, { itemId: 1, name: 1, price: 1 });
        const menuMap = new Map(menuItems.map(item => [item.name.toLowerCase(), item]));

        const items = [];
        let totalAmount = 0;

        for (const itemName in order) {
            const qty = order[itemName];

            if (qty < 1) {
                throw new Error(`Invalid quantity for '${itemName}'. Minimum quantity is 1.`);
            }

            const menuItem = menuMap.get(itemName.toLowerCase());
            if (!menuItem) {
                throw new Error(`Item '${itemName}' not found in the menu.`);
            }

            const total = qty * menuItem.price;
            items.push({
                itemId: menuItem.itemId,
                qty,
                total
            });
            totalAmount += total;
        }

        if (totalAmount <= 0) {
            throw new Error('Invalid order total.');
        }

        // Save the order
        const newOrder = new Order({
            orderId: new mongoose.Types.ObjectId().toString(),
            amount: totalAmount,
            items,
        });

        await newOrder.save();

        // Clear session order after completion
        delete inProgressOrders[sessionId];

        res.json({
            fulfillmentText: `✅ Order placed successfully! 🎉 Order ID: ${newOrder.orderId}, Total: ₹${totalAmount}.`
        });
    } catch (error) {
        console.error('Order completion error:', error.message);
        let message = '❌ Failed to place order. ';

        if (error.message.includes('Invalid quantity')) {
            message += 'Please specify valid quantities (minimum 1).';
        } else if (error.message.includes('not found in the menu')) {
            message += 'Some items are unavailable. Please review your cart.';
        } else {
            message += 'Please check your cart and try again.';
        }

        res.json({ fulfillmentText: message });
    }
}

// Handle "track order" intent
async function trackOrder(parameters, sessionId, res) {
    const orderId = parameters['order_id'];

    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        res.json({ fulfillmentText: `Please provide a valid Order ID.` });
        return;
    }

    console.log('Tracking order:', orderId);

    try {
        const response = await axios.get(`${API_BASE_URL}/${orderId}/track`); // Call Track Order API
        console.log('Order status:', response.status);

        res.json({
            fulfillmentText: `Order status: ${response.data.order.status}.`,
            outputContexts: resetContext(sessionId)
        });

    } catch (error) {
        console.error('Error tracking order:', error.message);
        res.json({
            fulfillmentText: `Could not track order with ID ${orderId}. Please try again.`,
            outputContexts: resetContext(sessionId)
        });
    }
}

// Function to reset context while keeping the same sessionId
function resetContext(sessionId) {
    return [
        {
            name: `projects/YOUR_PROJECT_ID/agent/sessions/${sessionId}/contexts/order-tracking`,
            lifespanCount: 0,  // Reset context immediately
        }
    ];
}



module.exports = router;
