const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    // const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent as "Bearer <token>"

    // if (!token) {
    //     return res.status(401).json({ message: 'Authentication failed: No token provided' });
    // }

    // try {
    //     const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using your secret
    //     req.userData = { userId: decodedToken.userId, email: decodedToken.email }; // Attach user data to the request
    //     next(); // Continue to the next middleware or route handler
    // } catch (error) {
    //     return res.status(401).json({ message: 'Authentication failed: Invalid token', error });
    // }
    next();
};

module.exports = checkAuth;
