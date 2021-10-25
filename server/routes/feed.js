const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const isAuth = require('../middleware/is-auth');

router.get('/posts', feedController.getPosts);

router.post('/create-post', isAuth, feedController.createPost);

router.post('/delete-post', isAuth, feedController.deletePost);

router.get('/count', feedController.getCount);

router.post('/getPostById', feedController.getPostById);

router.post('/create-comment', isAuth, feedController.createComment);

router.post('/delete-comment', isAuth, feedController.deleteComment);

router.post('/edit-comment', isAuth, feedController.editComment);

module.exports = router;