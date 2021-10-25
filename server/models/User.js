const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    totalPostsCreated: {
        type: Number
    },
    posts: [{
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);