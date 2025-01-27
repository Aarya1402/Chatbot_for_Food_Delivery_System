// Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose for database connection
const app = express();

const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

// Connect to the database
mongoose
    .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database successfully!');
    })
    .catch((error) => {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit if the connection fails
    });

// Import routes
const menuRoutes = require('./Routes/menu');
const orderRoutes = require('./Routes/orders');
const userRoutes = require('./Routes/users');
const chatbotRoutes = require('./Chatbot/chatbot'); // Import chatbot routes

// Add headers to handle CORS Errors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Specify the allowed origin
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Respond with 200 for preflight requests
    }

    next();
});

// Middleware for parsing JSON
app.use(express.json());

// Route definitions
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/chatobt', chatbotRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Food Delivery API!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
