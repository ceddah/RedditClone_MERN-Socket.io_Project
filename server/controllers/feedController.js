const Post = require('../models/Post');
const User = require('../models/User');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 5;
    try {
        const postsCount = await Post.find().countDocuments();
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({ message: 'Posts are fetched!', data: posts, postsCount: postsCount });
    } catch(err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    try {
        const activeUser = await User.findOne({ email: req.authUser });
        const post = new Post({
            title: title,
            content: content,
            author: {
                authorId: activeUser._id,
                authorName: activeUser.username
            },
            comments: []
        });
        const result = await post.save();
        const postId = result._id;
        activeUser.posts.push(postId);
        activeUser.totalPostsCreated += 1;
        const updatedUserPosts = await activeUser.save();
        io.getIO().emit('posts', { action: 'addNewPost', post: result });
        res.status(201).json({ message: 'Post Created.', data: result, authUser: updatedUserPosts });
    } catch(err) {
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.body.postId;
    try {
        const post = await Post.findByIdAndRemove(postId);
        const user = await User.findById(post.author.authorId);
        if(!post || !user) {
            res.status(400).json({ message: 'Unable to find Post/User. Please Try to relog.' })
        }
        user.posts.pull(post._id);
        await user.save();
        io.getIO().emit('posts', { action: 'removePost', postId: postId });
        res.status(204).json({ message: 'Post deleted successfully.'});
    } catch(err) {
        next(err);
    }
}

exports.getCount = async (req, res, next) => {
    const DAY = 86400000;
    try {
        const posts = await Post.find();
        const todaysPosts = posts.filter(post => {
            const createdAt = new Date(post.createdAt).getTime();
            const currentTime = new Date().getTime();

            if((currentTime - createdAt) < DAY) {
                return post;
            }
        })
        res.status(200).json({ postCount: todaysPosts.length });
    } catch(err) {
        next(err);
    }
}

exports.getPostById = async (req, res, next) => {
    const postId = req.body.postId;

    try {
        const post = await Post.findById(postId);
        if(!post) {
            res.status(400).json({ message: `Unable to find Post with ID: ${postId}` })
        }
        res.status(200).json({ message: 'Post fetched successfully.', post: post });
    } catch(err) {
        next(err);
    }
}

exports.createComment = async (req, res, next) => {
    const commAuthorId = req.body.authorId;
    const commAuthorName = req.body.authorName;
    const comment = req.body.comment;
    const postId = req.body.postId;

    try {
        const post = await Post.findById(postId);
        if(!post) {
            res.status(400).json({ message: `Unable to find Post with ID: ${postId}` })
        }
        post.comments.push({ commAuthorId: commAuthorId, commAuthorName: commAuthorName, comment: comment });
        const updatedPost = await post.save();
        io.getIO().emit('comments', { action: 'addNewComment', post: updatedPost });
        res.status(201).json({ message: 'New comment appended.', updatedPost: updatedPost });
    } catch(err) {
        next(err);
    }
}

exports.deleteComment = async (req, res, next) => {
    const commentId = req.body.commentId;
    const postId = req.body.postId;
    try {
        const post = await Post.findById(postId);
        if(!post) {
            res.status(400).json({ message: `Unable to find Post with ID: ${postId}` })
        }
        post.comments.pull(commentId);
        const updatedPost = await post.save();
        io.getIO().emit('comments', { action: 'removeComment', post: updatedPost });
        res.status(200).json({ message: 'Successfully deleted a comment'});
    } catch(err) {
        next(err);
    }
}

exports.editComment = async (req, res, next) => {
    const commentContent = req.body.commentContent;
    const commentId = req.body.commentId;
    const postId = req.body.postId;
    try {
        await Post.updateOne({ 'comments._id': commentId }, { '$set': {
            'comments.$.comment': commentContent
        }});
        const updatedPost = await Post.findById(postId);
        if(!updatedPost) {
            res.status(400).json({ message: `Unable to find Post with ID: ${postId}` })
        }
        io.getIO().emit('comments', { action: 'editComment', post: updatedPost });
        res.status(200).json({ message: 'Successfully edited a comment'});
    } catch(err) {
        next(err);
    }
}