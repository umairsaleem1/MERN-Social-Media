const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const cloudinary = require('../utils/cloudinary');
const sendEmail = require('../utils/sendEmail');
const { signupSchemaValidation, resetPasswordSchemaValidation } = require('../validationSchemas');
const User = require('../models/user');
const ResetPassword = require('../models/resetPassword');




// Checking username available or not
router.post('/username', async (req, res)=>{
    try{
        const user = await User.findOne({username:req.body.username});
        if(user){
            return res.status(406).json({
                message:'Username not available'
            })
        }
        res.status(200).json({
            message: 'Username available'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});







// Signup
router.post('/signup', upload.single('profileImage'), async (req, res)=>{
    try{
        const { name, email, password, cpassword, username, bio, facebook, instagram, twitter} = req.body;
        
        // validating request 
        const isValid = signupSchemaValidation({name, email, password, cpassword, username, file:req.file});
        if(!isValid){
            return res.status(400).json({
                message: 'Please fill out the required fields'
            })
        }

        // checking if user already exists
        const user = await User.findOne({email:email});
        if(user){
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // uploading profileImage to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({
            profileImage: result.secure_url,
            cloudinary_id: result.public_id,
            name,
            email,
            password: hashedPassword,
            username,
            bio,
            socialLinks: {facebook, instagram, twitter}
        });
       
        // saving the user in DB
        await newUser.save();


        res.status(201).json({
            message: 'User registered successfully...'
        });

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        })
    }
});






// Login
router.post('/login', async (req, res)=>{
    try{
        const { email, password } = req.body;
        
        // Making sure the user not left any field empty
        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // checking the user exists or not with the provided email
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // matching the passwords
        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // generating jwt
        const accessToken = await jwt.sign({id:user._id}, process.env.TOKEN_SECRET);
        res.cookie('accessToken',accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 86400000)
        });

        res.status(200).json({
            message: 'Login successfull'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});




// Forgot Password
router.post('/forgotpassword', async (req, res)=>{
    try{
        const { email } = req.body;

        // checking the user has sent email or not along with request
        if(!email){
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        // checking user exists or not with the provided email
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({
                message: 'User does not exist with the provided email'
            });
        }

        // Create password reset token and save in collection along with user's id
        // If there already is a document with current user, replace it
        const token = v4().toString().replace(/-/g, '');

        await ResetPassword.updateOne({user:user._id}, {$set:{token:token, user:user._id}}, {upsert:true})
        
        //send email to user containing password reset link
        const resetLink = `http://localhost:3000/resetpassword/${token}`;
        sendEmail(user.name, user.email, resetLink);

        res.status(200).json({
            message: 'Check your email address for password reset link!'
        });

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});







// Reset Password
router.post('/resetpassword/:token', async (req, res)=>{
    try{
        const { password } = req.body;
        const { token } = req.params;
        // checking if the token is present or not
        if(!token){
            return res.status(403).json({
                message: 'You are not eligible for making this request'
            });
        }

        // validating request 
        const isValid = resetPasswordSchemaValidation(req.body);
        if(!isValid){
            return res.status(400).json({
                message: 'Please match the fields crieteria'
            })
        }

        // validating token
        const isValidToken = await ResetPassword.findOne({token:token});
        if(!isValidToken){
            return res.status(404).json({
                message: 'It seems that the reset password link has been expired'
            });
        }

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // updating password
        await User.findByIdAndUpdate({_id: isValidToken.user}, {$set:{password:hashedPassword}});

        // deleting the reset token
        await ResetPassword.findByIdAndDelete({_id: isValidToken._id});

        res.status(200).json({
            message: 'Password Updated successfully'
        });
    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});







// authenticate a user
router.get('/authenticate', auth, async (req, res)=>{
    try{
        const user = await User.findOne({_id:req.id}).select('-email -password -cloudinary_id');
        res.status(200).json({
            user: user
        });

    }catch(e){
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
})


module.exports = router;