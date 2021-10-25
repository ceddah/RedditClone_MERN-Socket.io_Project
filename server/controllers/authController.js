const User = require('../models/User');
const Post = require('../models/Post');
const ActiveUser = require('../models/ActiveUser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const io = require('../socket');

exports.signIn = async (req, res, next) => {
    const errors = validationResult(req);
    let errMessages = [];
    let msgAlreadySent;
    if(!errors.isEmpty()) {
        errMessages = errors.array().map(err => err.msg);
        return res.status(422).json({ errors: errMessages });
    }
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loadedUser = await User.findOne({ email: email });
        if(!loadedUser) {
            msgAlreadySent = errMessages.indexOf('User with this E-Mail Address does not exist');
            if(msgAlreadySent === -1) {
                errMessages.push('User with this E-Mail Address does not exist');
            }
            return res.status(401).json({ errors: errMessages });
        }

        const passwordAreEqual = await bcrypt.compare(password, loadedUser.password);
        if(!passwordAreEqual) {
            msgAlreadySent = errMessages.indexOf('The password your typed does not match with the E-Mail');
            if(msgAlreadySent === -1) {
                errMessages.push('The password your typed does not match with the E-Mail.');
            }
            return res.status(401).json({ errors: errMessages });
        }

        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRESIN }
        );

        const newActiveUser = new ActiveUser({ username: loadedUser.username, userId: loadedUser._id });
        await newActiveUser.save();
        //
        io.getIO().emit('activeUsers', { action: 'addNewUser', newActiveUser: newActiveUser });
        return res.status(200).json({ userData: { ...loadedUser._doc, token } });
    } catch(err) {
        if(errMessages.length === 0) {
            errMessages.push('Service Error. Failed to authenticated user.')
            return res.status(500).json({ errors: errMessages });
        }
        next(err);
    }
};

exports.createAccount = async (req, res, next) => {
    const errors = validationResult(req);
    let errMessages = [];
    if(!errors.isEmpty()) {
        errMessages = errors.array().map(err => err.msg);
        return res.status(422).json({ errors: errMessages });
    }
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const imageFile = req.file;
    let imageUrl;
    if(!imageFile) {
        imageUrl = 'images/default-avatar';
    } else {
        imageUrl = req.file.path.replace("\\" ,"/");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            avatar: imageUrl,
            totalPostsCreated: 0,
            posts: []
        });

        try {
            await user.save();
            return res.status(201).json({ message: 'User Created.' });
        } catch(err) {
            if(errMessages.length === 0) {
                errMessages.push('Service Error. Failed to create a new User.')
                return res.status(500).json({ errors: errMessages });
            }
            next(err);
        }
};


exports.getUser = async (req, res, next) => {
    const userId = req.body.userId;
    try {
        const userData = await User.findOne({ _id: userId });
        if(!userData) {
            res.status(400).json({ message: `Unable to find User with ID: ${userId}` })
        }
        res.status(200).json({ userObj: userData });
    } catch(err) {
        next(err);
    }
} 

exports.getActiveUsers = async (req, res, next) => {
    try {
        const activeUsers = await ActiveUser.find();
        res.status(200).json({ activeUsers: activeUsers });
    } catch(err) {
        console.log(err);
        next(err);
    }
}

exports.removeActiveUser = async (req, res, next) => {
    const userId = req.body.userId;
    try {
        await ActiveUser.deleteOne({ userId: userId});
        io.getIO().emit('activeUsers', { action: 'removeNewUser', userId: userId });
    } catch(err) {
        next(err);
    }
}

exports.getUserActivies = async (req, res, next) => {
    const userId = req.body.userId;
    const userComments = [];
    const userObjId = mongoose.Types.ObjectId(userId);

    try {
        const posts = await Post.find();
        for(let post of posts) {
            for(let comm of post.comments) {
                if(comm.commAuthorId.toString() === userObjId.toString()) { 
                    userComments.push({...comm._doc, postTitle: post.title, postId: post._id});
                }     
            }
       };
       const allPostsByUser = posts.filter(post => {
           if(post.author.authorId) {
               if(post.author.authorId.toString() === userObjId.toString()) {
                   return post;
               }
           }
       });
       res.status(200).json({ userComments: userComments, replies: userComments.length, allPostsByUser: allPostsByUser });
    } catch(err) {
        next(err);
    }
}