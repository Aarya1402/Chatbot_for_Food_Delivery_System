const express = require('express');
const router = express.Router();
const userController = require('../Controller/users-controller'); // Adjust the path as needed

// Get all users
router.get('/', userController.getAllUsers);

// Get a user by ID
router.get('/:userId', userController.getUserById);

// Create a new user
router.post('/', userController.createUser);

// Update a user
router.put('/:userId', userController.updateUser);

// Delete a user
router.delete('/:userId', userController.deleteUser);

module.exports = router;
