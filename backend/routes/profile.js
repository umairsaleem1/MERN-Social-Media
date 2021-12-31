const router = require('express').Router();
const User = require('../models/user');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const cloudinary = require('../utils/cloudinary');


// get user profile
router.get('/profile/:userId',auth , async (req, res)=>{
    try{
        // id of the user of which profile is requested
        const { userId } = req.params;
        
        const user = await User.findOne({_id:userId});
        
        res.status(200).json({
            profileUser:user
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});





// update cover image
router.put('/profile/:userId/coverImage', auth, upload.single('coverImage'), async (req, res)=>{
    try{
        const { userId } = req.params;
        // checking whether the user has choosen any image or not
        if(!req.file){
            return res.status(400).json({
                message: 'Please choose an image'
            });
        }

        // uploading coverImage to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // object that contains cover image to update in db
        let dataToUpdate = {
            coverImage: result.secure_url,
            coverImage_cloudinaryId: result.public_id
        }

        const user = await User.findByIdAndUpdate({_id:userId}, {$set:dataToUpdate});

        // deleting the non edited version coverImage from cloudinary if previously has any
        if(user.coverImage_cloudinaryId.length){
            await cloudinary.uploader.destroy(user.coverImage_cloudinaryId);
        }

        res.status(200).json({
            message: 'CoverImage updated successfully'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});





// update profileImage
router.put('/profile/:userId/profileImage', auth, upload.single('profileImage'), async (req, res)=>{
    try{
        const { userId } = req.params;
        // checking whether the user has choosen any image or not
        if(!req.file){
            return res.status(400).json({
                message: 'Please choose an image'
            });
        }

        // uploading profileImage to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // object that contains profile image to update in db
        let dataToUpdate = {
            profileImage: result.secure_url,
            cloudinary_id: result.public_id
        }

        const user = await User.findByIdAndUpdate({_id:userId}, {$set:dataToUpdate});

        // deleting the non edited version profileImage from cloudinary
        if(user.cloudinary_id.length){
            await cloudinary.uploader.destroy(user.cloudinary_id);
        }

        res.status(200).json({
            message: 'ProfileImage updated successfully'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});


module.exports = router;