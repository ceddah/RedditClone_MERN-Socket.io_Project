const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        authorName: {
            type: String,
            required: true
        }
    },
    comments: [{
        type: new mongoose.Schema({
            commAuthorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
                //required: true
            },
            commAuthorName: {
                type: String
                //required: true
            },
            comment: {
                type: String
                //required: true
            }
        }, { timestamps: true })
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);