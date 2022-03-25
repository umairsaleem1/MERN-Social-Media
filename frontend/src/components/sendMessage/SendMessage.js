import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import Picker from 'emoji-picker-react';
import MicRecorder from 'mic-recorder-to-mp3';
import { ToastContainer, toast } from 'react-toastify';
import useSound from 'use-sound';
import updateChatOverview from '../../utils/updateChatOverview';
import Context from '../../context/Context';
import likeSound from '../../sounds/like.mp3'; 
import './sendMessage.css';
import 'react-toastify/dist/ReactToastify.css'; 


const SendMessage = ( { selectedFile, setSelectedFile, setPreview, message, setMessage } )=>{


    // getting values & methods from global state
    const [, , user, , , , socketRef, , , , , , , selectedConversationId, , selectedConversationInfo, , , setChats, , setMessages] = useContext(Context);

    const [playLikeSound] = useSound(likeSound);




    // state to show or hide the emoji picker of text/image component
    const [showPicker, setShowPicker] = useState(false);



    // ####### useEffects for text/image send component ########

    // create a preview(set url of selected file) , whenever selected file is changed
    useEffect(()=>{
        if(!selectedFile){
            setPreview(undefined);
            return;
        }

        // generating the url of the selected file
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return ()=>{
            URL.revokeObjectURL(objectUrl);
        }

    }, [selectedFile, setPreview])


    // useEffect to focus the input box when component is rendered
    useEffect(()=>{
        if(messageTextInputRef.current){
            messageTextInputRef.current.focus();
        }
    }, [])






     // reference of textInuput field
     const messageTextInputRef = useRef();








    // ####### States for Voice send component ########

    // state that will contain a boolean that indicates either the user is recording voice or not
    const[isRecording, setIsRecording] = useState(false);
    // state that will contain date(date & time) when the user started recording voice message(if user is not recording then it will be null)
    const [date, setDate] = useState(null);
    // state that will contain time elapsed since the user started recording voice message
    const [time, setTime] = useState({m:0, s:0})

    // New instance of MicRecorder
    const [micRecorder, setMicRecorder] = useState(new MicRecorder({bitRate:128}));





    // if user has started recording voice, then update the elapsed(recording) time after every 1 second
    if(date){
        setTimeout(()=>{
            let newDate = new Date(new Date(Date.now()) - date);
            // console.log(newDate);
            setTime({m:newDate.getMinutes(), s:newDate.getSeconds()})
        }, 1000)
    }








    // ########## Functions for text/image send component ###########

    const handleMessageTextChange = (e)=>{
        setMessage(e.target.value);

        const formatedName = user.name.split(' ').map((item)=>{
            return item[0].toUpperCase()+item.slice(1)
        }).join(' ');

        // firing typing event to server when the text input value changes
        socketRef.current.emit('typing', String(selectedConversationId), formatedName);

    }
    const handleMessageInputKeyUp = (e)=>{
        if(e.keyCode===13){
            sendMessage();
        }
    }


    // handler that will set file in state when ever the user clicks on select button
    const onSelectingFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedFile(undefined);
            return;
        }
        setSelectedFile(e.target.files[0]);
    }


    // handler that will be called when user clicks on any emoji from emoji picker
    const onEmojiClick = (event, emojiObject) => {
        setMessage(message + emojiObject.emoji);
        setShowPicker(false);
        messageTextInputRef.current.focus();
    };









    // ########## Functions for voice send component ##########

    
    // handler that will be called when the user clicks on voice recording button
    const startRecording = ()=>{

        // checking premissions of the web browser to access the microphone for recording audio
        navigator.mediaDevices.getUserMedia({audio:true})
        .then(async ()=>{
            // if premissions are granted then below code will execute
            try{
                // starting the audio recorder
                await micRecorder.start();
                setDate(new Date(Date.now()));
                setIsRecording(true);


                const formatedName = user.name.split(' ').map((item)=>{
                    return item[0].toUpperCase()+item.slice(1)
                }).join(' ');

                // firing startRecording event to server when the user starts recording
                socketRef.current.emit('startRecording', String(selectedConversationId), formatedName);

            }catch(e){
                toast.error('Some problem occurred while recording audio', {
                    position:"top-center",
                    autoClose:3000
                });
                setIsRecording(false);
            }
        })
        .catch(()=>{
            // if premissions are denied then below code will execute
            toast.error('Permission was required for recording audio, please allow it', {
                position:"top-center",
                autoClose:3000
            });
        })
    }

    // handler(which will stop and delete audio) that will be called when the user clicks on delete recording icon
    const cancelRecording = async ()=>{

        const formatedName = user.name.split(' ').map((item)=>{
            return item[0].toUpperCase()+item.slice(1)
        }).join(' ');

        // firing stopRecording event to server when the user stops recording
        socketRef.current.emit('stopRecording', String(selectedConversationId), formatedName);

        // reseting values
        setDate(null);
        setTime({m:0, s:0});
        setIsRecording(false);
        try{
            await micRecorder.stop();
        }catch(e){
            console.log(e);
        }

    }

    // handler that will stop the audio recording and return mp3 file of that recorded audio
    const stopRecording = async ()=>{

        const formatedName = user.name.split(' ').map((item)=>{
            return item[0].toUpperCase()+item.slice(1)
        }).join(' ');

        // firing stopRecording event to server when the user stops recording
        socketRef.current.emit('stopRecording', String(selectedConversationId), formatedName);
        
        try{
            const [buffer, blob] = await micRecorder.stop().getMp3();

            // Creating mp3 file
            const file = new File(buffer, `Aud-${Date.now()}.mp3`, {
                type: blob.type,
                lastModified: Date.now()
            });
            
            let recordedTime = time;

            // reseting values
            setDate(null);
            setTime({m:0, s:0});
            setIsRecording(false);

            // calling sendMessage function to send the recorded audio
            sendMessage(file, recordedTime);
        }catch(e){
            console.log(e);
        }
    }










    
    // handler that will be called when user clicks on sendMessage btn of audio/text/image message
    async function sendMessage(audioFile, recordedTime){
        try{
            // creating formData bcz multer only understands formData
            let formData = new FormData();

            if(audioFile){
                formData.append('messageMedia', audioFile)
                formData.append('messageMediaType', 'aud');
                formData.append('recordedMin', recordedTime.m);
                formData.append('recordedSec', recordedTime.s);
            }else{
                formData.append('text', message.trim());
                if(selectedFile){
                    formData.append('messageMedia', selectedFile);
                    formData.append('messageMediaType', 'img');
                }
            }
            
            const res = await fetch(`/messages?chatId=${selectedConversationId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();

            //reseting values
            setMessage('');
            setSelectedFile(undefined);
            setPreview(undefined);
            

            setMessages((messages)=>{
                return [...messages, data.savedMessage]
            });


            playLikeSound();
            

            // // emiting event 'send-message' along with new sent message, slectedConversationId(room id) & recordedTime of audio(if voice message else will be undefined) as data
            // socketRef.current.emit('send-message', data.savedMessage, String(selectedConversationId), recordedTime);

            // calling updateChatOverview utility function to show recent message on ConversationOverview
            updateChatOverview(setChats, selectedConversationId, data.savedMessage, recordedTime);






            // ############ Creating notification of this new message

            let messageNotificationReceivers = selectedConversationInfo.users.map((selectedUser)=>{
                return selectedUser._id;
            })
            messageNotificationReceivers = messageNotificationReceivers.filter((selectedUserId)=>{
                return selectedUserId!==user._id;
            })
            const newNotification = {
                messageNotificationReceivers: messageNotificationReceivers,
                notificationType: 'message',
                notificationChatId: selectedConversationId
            };


            // making request to backend to create a new notification of like
            const notiRes = await fetch('/notifications', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNotification)
            })

            if(!notiRes.ok){
                throw new Error(notiRes.statusText);
            }

            const notiData = await notiRes.json();
                
            // emiting event 'send-message' along with new sent message, slectedConversationId(room id) & recordedTime of audio(if voice message else will be undefined) as data
            socketRef.current.emit('send-message', data.savedMessage, String(selectedConversationId), recordedTime, notiData.savedNotification);
            // socketRef.current.emit('likeNotification', notiData.savedNotification)
            

        }catch(e){
            console.log(e);
        }
    }

    return(
        <div className='message-send-area'>
            {
                !isRecording
                ?
                <>
                <div className='message-input-container'>
                    {/* <form encType='multipart/form-data' onSubmit={()=> false}> */}
                        <input type='text' placeholder='Message' className='message-text-input' value={message} onChange={handleMessageTextChange} ref={messageTextInputRef} onKeyUp={handleMessageInputKeyUp} />
                        <i className="far fa-grin" onClick={()=>setShowPicker(!showPicker)} style={showPicker ? {background:'#d1e1ff'} : null}></i>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                            <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-.29.71L16 14l-2 2-6-6-4 4V7a1 1 0 011-1h14a1 1 0 011 1zm-2-7a2 2 0 11-2-2 2 2 0 012 2z"></path>
                        </svg>
                        <input type='file' name='messageImage' accept='image/*' className='message-file-input' onChange={onSelectingFile} />

                        {
                            showPicker && <Picker pickerStyle={{ position: 'absolute', top:'-330px', left:'0px'}} onEmojiClick={onEmojiClick}/>
                        }
                    {/* </form> */}
                </div>
                                
                {
                    message.trim().length || selectedFile
                    ?
                    <motion.button className='msg-snd-btn' onClick={()=>sendMessage(null)}
                        initial={{scale:1}}
                        whileTap={{scale:0.85}}
                    >
                        <svg viewBox="0 0 24 24" width="21" height="23">
                            <path fill="currentColor" d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                        </svg>
                    </motion.button>
                    :
                    <motion.button className='msg-mic-btn' onClick={startRecording}
                        initial={{scale:1}}
                        whileTap={{scale:0.85}}
                    >
                        <i className="fas fa-microphone"></i>
                    </motion.button>
                }
                </>

                :
                <>
                <div className='audio-message-recording-wrapper'>
                    <div className='audio-message-recording'>
                        <motion.i className="fas fa-trash audio-cancel-btn" onClick={cancelRecording}
                            initial={{background:'#EBEDF0'}}
                            whileTap={{background:'rgb(212, 212, 212)'}}
                        ></motion.i>
                        <span>{time.m}:{time.s<10 ? '0'+time.s : time.s}</span>
                        <i className="fas fa-microphone red-mic-icon"></i>
                    </div>
                </div>
                <motion.button className='voice-snd-btn' onClick={stopRecording}
                    initial={{scale:1}}
                    whileTap={{scale:0.85}}
                >
                    <svg viewBox="0 0 24 24" width="21" height="23">
                        <path fill="currentColor" d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                    </svg>
                </motion.button>
                </>
            }
            <ToastContainer theme='colored'/>
        </div>
    );
}

export default SendMessage;