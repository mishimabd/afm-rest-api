const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const verifyJwt = promisify(jwt.verify);

const extractAuthorId = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = await verifyJwt(token, process.env.JWT_SECRET);
        req.author_id = decoded.id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = {
    extractAuthorId
};