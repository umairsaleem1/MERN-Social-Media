const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const cloudinary = require('../utils/cloudinary');


// get user profile
router.get('/profile/:userId',auth , async (req, res)=>{
    try{
        // id of the user of which profile is requested
        const { userId } = req.params;
        
        const user = await User.findOne({_id:userId}).populate('followers').populate('following');
        
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







// update profile
router.put('/profile/:userId', auth, upload.any(), async (req, res)=>{
    try{
        const { userId } = req.params;
        const { password, cpassword, bio, socialLinks } = req.body;
        // checking whether the user has made any updates or not
        if(!password && !bio && !socialLinks && !req.files.length){
            return res.status(400).json({
                message: 'No updates received'
            });
        }
        // checking password and cpassword are equal if provided
        if(password && password!==cpassword){
            return res.status(400).json({
                message: 'Password & Confirm Password not matching'
            });
        }
        

        // uploading image/images to cloudinary if any
        let result1 = {
            secure_url: '',
            public_id: ''
        }
        let result2 = {
            secure_url: '',
            public_id: ''
        }
        if(req.files[0]){
            if(req.files[0].fieldname==='coverImage'){
                result1 = await cloudinary.uploader.upload(req.files[0].path);
            }
            else if(req.files[0].fieldname==='profileImage'){
                result2 = await cloudinary.uploader.upload(req.files[0].path);
            }
        }
        if(req.files[1]){
            if(req.files[1].fieldname==='coverImage'){
                result1 = await cloudinary.uploader.upload(req.files[1].path);
            }
            else if(req.files[1].fieldname==='profileImage'){
                result2 = await cloudinary.uploader.upload(req.files[1].path);
            }
        }
        


        // object that contains userProfile data to update in db
        let dataToUpdate = {};
        if(bio){
            dataToUpdate.bio = bio;
        }
        if(socialLinks){
            dataToUpdate.socialLinks = JSON.parse(socialLinks);
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            dataToUpdate.password = hashedPassword;
        }
        if(result1.secure_url.length){
            dataToUpdate.coverImage = result1.secure_url;
            dataToUpdate.coverImage_cloudinaryId = result1.public_id;
        }
        if(result2.secure_url.length){
            dataToUpdate.profileImage = result2.secure_url;
            dataToUpdate.cloudinary_id = result2.public_id;
        }
        

        // updating user in DB
        const updatingUser = await User.findByIdAndUpdate({_id:userId}, {$set:dataToUpdate});

        // deleting the non edited version user's cover/profile image from cloudinary if the request contains any update
        if(result1.secure_url.length){
            if(updatingUser.coverImage_cloudinaryId.length){
                await cloudinary.uploader.destroy(updatingUser.coverImage_cloudinaryId);
            }
        }
        if(result2.secure_url.length){
            if(updatingUser.cloudinary_id.length){
                await cloudinary.uploader.destroy(updatingUser.cloudinary_id);
            }
        }

        res.status(200).json({
            message: 'Profile updated successfully...'
        });

    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});





// Search for user
router.get('/searchUser', auth, async (req, res)=>{ 
    try{
        // the string that we want to match for in name field of user document
        const name = req.query.name; 
        if(!name){
            return res.status(400).json({
                message: 'Please enter atleast 1 character'
            });
        }
        const users = await User.find({ name : { '$regex' : name, '$options' : 'i' }});
        
        res.status(200).json({
            users: users
        });
        
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});






// follow or unfollow a user
router.get('/profile/:userId/follow', auth, async (req, res)=>{
    try{
        const { userId } = req.params;
         // follow is a query parameter that shows either the loggedIn user follows or unfollows the user of which profile is opened
         const { follow } = req.query;

         if(follow==='true'){
            // if follows the user then adding the loggdIn user to profleUser's followers list field
            await User.findByIdAndUpdate({_id:userId}, {$push:{followers:req.id}});
            // if follows the user then adding the profileUser to loggedIn user's following list field
            await User.findByIdAndUpdate({_id:req.id}, {$push:{following:userId}});

            res.status(200).json({
                message: 'Follow successful'
            });
         }
         else if(follow==='false'){
            // if unfollows the user then removing the loggdIn user from profleUser's followers list field
            await User.findByIdAndUpdate({_id:userId}, {$pull:{followers:req.id}});
            // if unfollows the user then removing the profileUser from loggedIn user's following list field
            await User.findByIdAndUpdate({_id:req.id}, {$pull:{following:userId}});

            res.status(200).json({
                message: 'UnFollow successful'
            });
         }
    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});


module.exports = router;