const User = require('../Models/user'); // Adjust the path to the User model as needed

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    const { userId, username, email, phoneNumber, password, address, pincode } = req.body;
    try {
        const newUser = new User({ userId, username, email, phoneNumber, password, address, pincode });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate({ userId }, updates, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await User.findOneAndDelete({ userId });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};
