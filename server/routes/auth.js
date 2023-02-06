const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const User = require('../models/User');
const isAuth = require('../middleware/is-auth');

router.post('/sign-in', [
    body('email', 'Please enter a valid E-Mail Address').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long.').isLength({ min: 6 }).trim()
], authController.signIn);

router.post('/sign-up', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid E-Mail Address')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if(userDoc) {
                    return Promise.reject('E-Mail Address already exists.')
                }
            })
        })
        .normalizeEmail(),
    body('username').trim().isLength({ min: 4, max: 25 }).withMessage('Username must be between 4 and 25 characters.'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords need to match.');
          }
          return true;
    })
], authController.createAccount);

router.post('/getUser', authController.getUser);

router.get('/getActiveUsers', authController.getActiveUsers);

router.post('/removeActiveUser', authController.removeActiveUser);

router.post('/getUserActivies', authController.getUserActivies);

module.exports = router;