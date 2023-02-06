const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        return res.status(401).json({ error: 'You need to sign-in before creating any Posts.' });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch(err) {
        return res.status(401).json({ error: 'You need to sign-in before creating any Posts.' });
    }
    if(!decodedToken) {
        return res.status(401).json({ error: 'You need to sign-in before creating any Posts.' });
    }
    req.authUser = decodedToken.email;
    next();
};