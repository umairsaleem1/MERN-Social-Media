const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postText: {
        type: String,
        trim: true
    },
    postMedia: {
        type: String
    },
    postMediaType: {
        type: String
    },
    cloudinaryId: {
        type: String
    },
    postLocation: {
        type: String
    },
    postAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps:true})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;