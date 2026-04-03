const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header missing'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token missing'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret');

        req.user = {
            userId: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { authenticate };
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};
module.exports = { authenticate, requireRole };