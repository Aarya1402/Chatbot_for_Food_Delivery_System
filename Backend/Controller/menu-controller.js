const Menu = require('../Models/menu'); // Adjust the path if necessary

// Browse all menu items
exports.getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error });
    }
};

// Get a single menu item by ID
exports.getMenuItemById = async (req, res) => {
    const { itemId } = req.params;
    try {
        const menuItem = await Menu.findOne({ itemId });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item', error });
    }
};

// Add a new menu item
exports.addMenuItem = async (req, res) => {
    const { itemId, name, description, price, category, imageUrl } = req.body;
    try {
        const newMenuItem = new Menu({ itemId, name, description, price, category, imageUrl });
        await newMenuItem.save();
        res.status(201).json({ message: 'Menu item added successfully', menuItem: newMenuItem });
    } catch (error) {
        res.status(400).json({ message: 'Error adding menu item', error });
    }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
    const { itemId } = req.params;
    const updates = req.body;
    try {
        const updatedMenuItem = await Menu.findOneAndUpdate({ itemId }, updates, { new: true, runValidators: true });
        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item updated successfully', menuItem: updatedMenuItem });
    } catch (error) {
        res.status(400).json({ message: 'Error updating menu item', error });
    }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        const deletedMenuItem = await Menu.findOneAndDelete({ itemId });
        if (!deletedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
};
