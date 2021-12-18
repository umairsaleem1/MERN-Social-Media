const router = require('express').Router();
const Post = require('../models/post');
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
        await post.save();

        res.status(201).json({
            message: 'Post Created successfully...'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});






// Get all posts
router.get('/posts', auth, async (req, res)=>{
    try{
        const posts = await Post.find().populate('postAuthor', '-password -email');
        // const posts = await Post.find({postAuthor: req.id}).populate('postAuthor', '-password -email');
        res.status(200).json({
            posts:posts
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
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
        if(updatingPost.cloudinaryId.length){
            await cloudinary.uploader.destroy(updatingPost.cloudinaryId)
        }

        res.status(200).json({
            message: 'Post updated successfully...'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }

});


module.exports = router;