const jwt = require('jsonwebtoken');

// Middleware for validating JWT tokens
const jwtAuthMiddleware = (req, res, next) => {

    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) return res.status(401).json({ message: 'Authorization header not provided.' });
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    }catch (err) {
        return res.status(401).json({ message: 'Invalid token' });  
    }

}

// Middleware for generating JWT tokens

const generateToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { jwtAuthMiddleware, generateToken };
