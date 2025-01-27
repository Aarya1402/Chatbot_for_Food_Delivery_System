const express = require('express');
const router = express.Router();
const menuController = require('../Controller/menu-controller'); // Adjust the path as needed

// Browse all menu items
router.get('/', menuController.getAllMenuItems);

// Get a single menu item by ID
router.get('/:itemId', menuController.getMenuItemById);

// Add a new menu item
router.post('/', menuController.addMenuItem);

// Update a menu item
router.put('/:itemId', menuController.updateMenuItem);

// Delete a menu item
router.delete('/:itemId', menuController.deleteMenuItem);

module.exports = router;
