const router = require('express').Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const cloudinary = require('../utils/cloudinary');


// Create new post
router.post('/posts', auth, upload.single('postMedia'), async (req, res)=>{
    try{
        const { text , location, media } = req.body;
        // checking whether the user has not sent empty post to save
        if(!text && !req.file){
            return res.status(400).json({
                message: 'Please enter something to post'
            });
        }

        // uploading post media to cloudinary
        let result = {
            secure_url: '',
            public_id: ''
        }
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
        }
        
        // creting new post
        const post = new Post({
            postText: text,
            postMedia: result.secure_url,
            postMediaType: media,
            cloudinaryId: result.public_id,
            postLocation: location,
            postAuthor: req.id
        });
    
        // saving post in database
        const saved = await post.save();
        const savedPost = await Post.findOne({_id:saved._id}).populate('postAuthor');

        res.status(201).json({
            createdPost: savedPost
        });
    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});




 

// Get all posts to whome the loggedIn user follows or his own created
router.get('/posts', auth, async (req, res)=>{
    try{
        const { profileUserId, pageNo } = req.query; 

        let skips;
        // setting no of posts to skip
        if(Number(pageNo)===1){
            skips = 0;
        }else{
            skips = (pageNo-1)*10;
        }


        let posts;
        // if profileUserId is provided(means request made from profile page then in response send on his posts
        if(profileUserId){
            posts = await Post.find({postAuthor:profileUserId}).populate('postAuthor').populate('postLikes').populate({path:'postComments', populate:'commentAuthor commentLikes'}).skip(skips).limit(10).sort({createdAt:-1});
        }else{
            // following is an array who's items are id's of user's to whom the currently loggedIN user is following and including it's own id also
            let following;
            const user = await User.findOne({_id:req.id});
            following = [...user.following, req.id];

            posts = await Post.find({postAuthor:{$in:following}}).populate('postAuthor').populate('postLikes').populate({path:'postComments', populate:'commentAuthor commentLikes'}).skip(skips).limit(10).sort({createdAt:-1});  
        }

        res.status(200).json({
            posts:posts
        });
    }catch(e){ 
        res.status(500).json({  
            message: 'Some problem occurred'
        });
    }

})





// Get a single post
router.get('/posts/:postId', auth, async (req, res)=>{
    try{
        const { postId } = req.params;

        const post = await Post.findOne({_id:postId}).populate('postAuthor').populate('postLikes').populate({path:'postComments', populate:'commentAuthor commentLikes'});

        res.status(200).json({
            post:post
        });
    }catch(e){ 
        res.status(500).json({  
            message: 'Some problem occurred'
        });
        console.log(e);
    }
})






// Update a post
router.put('/posts/:id', auth,  upload.single('postMedia'), async (req, res)=>{
    try{
        const { id } = req.params;

        // checking whether the user has made any update to post or not
        if(!req.body.postText && !req.file){
            return res.status(400).json({
                message: 'No update received'
            });
        }

        // uploading post media to cloudinary
        let result = { 
            secure_url: '',
            public_id: ''
        }
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
        }

        // object that contains post data to update in db
        let dataToUpdate = req.body;
        if(result.secure_url.length){
            dataToUpdate.postMedia = result.secure_url;
            dataToUpdate.cloudinaryId = result.public_id;
        }


        // updating post in DB
        const updatingPost = await Post.findByIdAndUpdate({_id:id}, {$set:dataToUpdate});

        // deleting the non edited version post's postMedia(image or video) from cloudinary if the original post has any
        if(result.secure_url.length){
            if(updatingPost.cloudinaryId.length){
                if(updatingPost.postMediaType==='img'){
                    await cloudinary.uploader.destroy(updatingPost.cloudinaryId);
                }else{
                    await cloudinary.uploader.destroy(updatingPost.cloudinaryId, { resource_type: 'video' } )
                }
            }
        }

        const updatedPost = await Post.findOne({_id:id}).populate('postAuthor').populate('postLikes').populate({path:'postComments', populate:'commentAuthor commentLikes'});

        res.status(200).json({
            updatedPost: updatedPost
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }

});








// Delete a post
router.delete('/posts/:id', auth, async (req, res)=>{
    try{
        const { id } = req.params;

        // deleting post from DB
        const deletedPost = await Post.findByIdAndDelete({_id:id});
        // deleting the postMedia from cloudinary if the post has any
        if(deletedPost.cloudinaryId.length){
            if(deletedPost.postMediaType==='img'){
                await cloudinary.uploader.destroy(deletedPost.cloudinaryId)
            }else{
                await cloudinary.uploader.destroy(deletedPost.cloudinaryId, { resource_type: 'video' });
            }
        }

        res.status(200).json({
            message: 'Post deleted successfully...'
        });

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }

});









// Like a post
router.get('/posts/:id/like', auth, async (req, res)=>{ 
    try{
        // id of the post
        const { id } = req.params;
        // liked is a query parameter that shows either the user has added(true) his like or removed(false) his like from the post
        const { liked } = req.query;
        
        if(liked==='true'){
            // if user liked the post, then adding the user to post likes list
            await Post.findByIdAndUpdate({_id:id}, {$push:{postLikes:req.id}});
            
            res.status(200).json({
                message:'Post has been liked'
            });
  
        }else if(liked==='false'){
            // if user removed liked from post, then deleting the user from post likes list  
            await Post.findByIdAndUpdate({_id:id}, {$pull:{postLikes:req.id}});
            
            res.status(200).json({
                message: 'Post like has been removed'
            });
        }

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});







// Create a new comment
router.post('/posts/:id/comments', auth, upload.single('commentImage'), async (req, res)=>{
    try{
        const { id } = req.params;
        // checking whether the user has not sent empty comment to save
        if(!req.body.commentText && !req.file){
            return res.status(400).json({
                message: 'Please fill out the required fields'
            });
        }

        // uploading comment image to cloudinary
        let result = {
            secure_url: '',
            public_id: ''
        }
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path);
        }

        
        // Create a new comment
        const comment = new Comment({
            commentText: req.body.commentText,
            commentImage: result.secure_url,
            cloudinaryId: result.public_id,
            commentAuthor: req.id
        })
        // saving comment in database
        await comment.save();

        // updating post by adding newly created comment's id into its postComments array field
        await Post.findByIdAndUpdate({_id: id}, {$push: {postComments: comment._id}});
        

        const createdComment = await Comment.findOne({_id:comment._id}).populate('commentAuthor');

        res.status(201).json({
            createdComment: createdComment
        });


    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred' 
        });
    }
});






// Update a comment
router.put('/posts/:postId/comments/:commentId', auth, upload.single('commentImage'), async (req, res)=>{
    try{
        const { commentId } = req.params;

        // checking whether the user has made any update to comment or not
        if(!req.body.commentText && !req.file){
            return res.status(400).json({
                message: 'No update received'
            });
        }

        // uploading comment image to cloudinary
        let result = {
            secure_url: '',
            public_id: ''
        }
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path);
        }

        // object that contains comment data to update in db
        let dataToUpdate = req.body;
        if(result.secure_url.length){
            dataToUpdate.commentImage = result.secure_url;
            dataToUpdate.cloudinaryId = result.public_id;
        }


        // updating comment in DB
        const updatingComment = await Comment.findByIdAndUpdate({_id:commentId}, {$set:dataToUpdate});

        // deleting the non edited version comment's image from cloudinary if the original comment has any
        if(result.secure_url.length){
            if(updatingComment.cloudinaryId.length){
                await cloudinary.uploader.destroy(updatingComment.cloudinaryId);    
            }
        }


        const updatedComment = await Comment.findOne({_id:commentId}).populate('commentAuthor');

        res.status(200).json({
            updatedComment: updatedComment
        });

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});






// delete a comment
router.delete('/posts/:postId/comments/:commentId', async (req, res)=>{
    try{
        const { postId, commentId } = req.params;

        // deleting comment from DB
        const deletedComment = await Comment.findByIdAndDelete({_id:commentId});
        // deleting the comment image from cloudinary if the post has any
        if(deletedComment.cloudinaryId.length){
            await cloudinary.uploader.destroy(deletedComment.cloudinaryId)
        }

        // deleting the commentId from post's postComments array field
        await Post.findByIdAndUpdate({_id:postId}, {$pull:{postComments:commentId}});

        res.status(200).json({
            message: 'Comment deleted successfully...'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});








// Like a comment
router.get('/posts/:postId/comments/:commentId', auth, async (req, res)=>{
    try{
        const { commentId } = req.params;
        // liked is a query parameter that shows either the user has added(true) his like or removed(false) his like from the comment
        const { liked } = req.query;

        if(liked==='true'){
            // if user liked the comment, then adding the user to comment likes list
            await Comment.findByIdAndUpdate({_id:commentId}, {$push:{commentLikes:req.id}});
            res.status(200).json({
                message: 'Comment like has been added'
            });
  
        }else if(liked==='false'){
            // if user removed liked from comment, then deleting the user from comment likes list  
            await Comment.findByIdAndUpdate({_id:commentId}, {$pull:{commentLikes:req.id}});
            res.status(200).json({
                message: 'Comment like has been removed'
            });
        }
    }catch(e){
        res.status(500).json({
            message: 'Post like has been removed'
        });
    }
});



module.exports = router;