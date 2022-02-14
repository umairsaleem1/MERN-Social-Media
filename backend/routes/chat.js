const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const Message = require('../models/message');
const Chat = require('../models/chat');
const cloudinary = require('../utils/cloudinary');





// create a new chat
router.post('/chats', auth, async (req, res)=>{
    try{
        const { user, isGrp } = req.body;

        // if chat is of not group type means individual chat
        if(!isGrp){
            // creating chat
            const chat = new Chat({
                users: [new ObjectId(user), req.id]
            });

            const savedChat = await chat.save();
            await savedChat.populate('users', {_id:1, name:1, profileImage:1});
            
            return res.status(201).json({
                savedChat: savedChat 
            });

        } 

    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});






// Get all chat history of particular user
router.get('/chats', auth, async (req, res)=>{
    try{
        const chats = await Chat.find({users:{$elemMatch:{$eq:req.id}}}).populate('users', {_id:1, name:1, profileImage:1});
        
        res.status(200).json({
            chats: chats
        });
    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});






// create a message
router.post('/messages', auth, upload.single('messageMedia'), async (req, res)=>{
    try{
        const { chatId } = req.query;

        const { text, messageMediaType, recordedMin, recordedSec } = req.body;

        // checking whether the user sent an empty message
        if(!text && !req.file){
            return res.status(400).json({
                message: 'Message is empty'
            });
        }

        // uploading message media to cloudinary
        let result = {
            secure_url: '',
            public_id: ''
        }
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
        }

        // creting new message
        const message = new Message({
            text: text,
            messageMedia: result.secure_url,
            messageMediaType: messageMediaType,
            cloudinaryId: result.public_id,
            messageSender: req.id
        });

        // saving message in database
        const savedMessage = await message.save();

        
        let lastMessage = savedMessage.text;
        let lastMessageDate = savedMessage.createdAt;
        if(messageMediaType==='img'){
            lastMessage = '<i className="fas fa-camera"></i>&nbsp;&nbsp;Photo'
        }
        if(messageMediaType==='aud'){
            lastMessage = `<i className="fas fa-microphone"></i>&nbsp;&nbsp;${recordedMin}:${Number(recordedSec)<10 ? '0'+recordedSec : recordedSec}`
        }

        // adding the new created message's id into it's respective chat messages field and updating its's lastMessage & lastMessageDate field
        await Chat.findByIdAndUpdate({_id: chatId}, {$push: {messages: savedMessage._id}, lastMessage: lastMessage, lastMessageDate: lastMessageDate});
    
        res.status(201).json({
            savedMessage: savedMessage
        });
    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});








// Get all messages of any particular chat
router.get('/messages/:chatId', auth, async (req, res)=>{
    try{
        const { chatId } = req.params;

        const chat = await Chat.findOne({_id:chatId}).populate('messages');

        res.status(200).json({
            chat: chat 
        });
    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});







// delete a chat
router.delete('/chats/:chatId', auth, async (req, res)=>{
    try{
        const { chatId } = req.params;

        const deletedChat = await Chat.findByIdAndDelete({_id:chatId});
        const msgsToDelete = deletedChat.messages;

        msgsToDelete.forEach(async (msgId)=>{
            const deletedMsg = await Message.findByIdAndDelete({_id:msgId});
            // deleting the message media from cloudinary if the message has any
            if(deletedMsg.cloudinaryId.length){
                if(deletedMsg.messageMediaType==='img'){
                    await cloudinary.uploader.destroy(deletedMsg.cloudinaryId)
                }else{
                    await cloudinary.uploader.destroy(deletedMsg.cloudinaryId, { resource_type: 'video' })
                }
            }
        })
        


        res.status(200).json({
            message: 'Chat deleted successfully...'
        });

    }catch(e){
        console.log(e);
        res.status(500).json({
            message: 'Some problem occurred'
        });
    }
});



module.exports = router;