import React, {useState, useEffect, useContext} from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { ToastContainer, toast } from 'react-toastify';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './conversationOverview.css';
import 'react-toastify/dist/ReactToastify.css';
 
const ConversationOverview = ( { showConversation, setShowConversation, chat, setShowUpdateGrp } )=>{
    const { _id, users, lastMessage, lastMessageDate, isGrp, grpAvatar, grpSubject } = chat;

    // getting values & methods from global state
    const [, , user, , , , , onlineUsers, , isTyping, , typingChatIds, , selectedConversationId, setSelectedConversationId, , setSelectedConversationInfo, chats, setChats, , setMessages, isRecording, , recordingChatIds, , , , , , , , , , , , messagesNotifications] = useContext(Context);




    // formatting lastMessageDate
    let formatedDate;

    let d1 = new Date(lastMessageDate);
    let d2 = new Date();
    let diff = Math.floor(d2.getTime() - d1.getTime());
    let day = 1000 * 60 * 60 * 24;

    let days = Math.floor(diff/day);
    if(days===0 && (d1.getDay()===d2.getDay())){
        let time = new Date(lastMessageDate).toLocaleTimeString();
        formatedDate = time.slice(0, time.length - 6) + time.slice(time.length-3);
    }
    else if(days===0 && (d1.getDay()!==d2.getDay())){
        formatedDate = 'Yesterday';
    }
    else if(days>0){
        formatedDate = d1.toLocaleDateString();
    }


    

    // state that will contain either any new message is available of this chat that is not read by the receiver(loggedInUser)
    const [newMessagesAvailable, setNewMessagesAvailable] = useState(false);
    
    
    useEffect(()=>{
        messagesNotifications.forEach((mN)=>{
            if(_id===mN.notificationChatId){
                setNewMessagesAvailable(true);
                return;
            }
        })
        const arr = messagesNotifications.filter((mN)=>{
            return _id===mN.notificationChatId;
        })
        if(!arr.length){
            setNewMessagesAvailable(false);
        }
        
    }, [messagesNotifications, _id])




    // state to show or hide delete chat button
    const [showChatDelete, setShowChatDelete] = useState(false);

    // delete chat btn loader
    const [showLoader, setShowLoader] = useState(false);


    const navigate = useNavigate();


    // handler to toggle visibility of individual chat's delete button & group chat's exit button
    const toggleDeleteVisibility = (e)=>{
        e.stopPropagation();
        setShowChatDelete(!showChatDelete); 

    }


    // handler that will be called when the user clicks on any conversation Overview
    const handleConversationOverviewClick = ()=>{
        setShowUpdateGrp(false);
        setShowConversation(true);
        setSelectedConversationId(_id);
        setSelectedConversationInfo(chat);
        setMessages([]);
        navigate(`/messages?id=${_id}`);
    }



    const deleteChat = async (chatId)=>{
        setShowLoader(true);
        try{
            const res = await fetch(`/chats/${chatId}`, {
                method:'DELETE',
                credentials:'include'
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();

            //reseting values
            setShowConversation(false);
            setSelectedConversationId(null);
            setMessages([]);
            let updatedChats = chats.filter((cht)=>{
                return _id!==cht._id;
            });
            setChats(updatedChats);
            setShowLoader(false);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

        }catch(e){
            setShowLoader(false);
            toast.error('Some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }

    
    return( 
        <>
        <div className='conversation-overview' style={selectedConversationId===_id && showConversation ? {background:'#eef3f8'} : null} onClick={handleConversationOverviewClick}>
            <div className='conversation-overview-avatar-container'>
                {
                    isGrp
                    ?
                    <img src={grpAvatar ? grpAvatar : '/images/grpPlaceholder.png'} alt='grpAvatar' />
                    :
                    <>
                    <img src={user._id===users[0]._id ? users[1].profileImage : users[0].profileImage} alt='avatar' />
                    {
                        ((user._id===users[0]._id && onlineUsers.includes(String(users[1]._id))) || (user._id===users[1]._id && onlineUsers.includes(String(users[0]._id))))
                        &&
                        <i className="fas fa-circle" style={{color:'green', marginRight:7, fontSize:20, position: 'absolute', bottom: 15, right:0}}></i>
                    }
                    </>
                }
            </div>
            <div className='conversation-overview-info-container'>
                <div className='conversation-overview-info-container-top'>
                    <p style={!lastMessage ? {marginTop:'13px'} : null}> 
                        {
                            isGrp
                            ?
                                grpSubject
                            :
                                user._id===users[0]._id
                                ?
                                formatName(users[1].name)
                                :
                                formatName(users[0].name)
                        }
                    </p>
                    {
                        lastMessageDate && <span style={newMessagesAvailable ? {color:'green'} : null}> {formatedDate} </span>
                    }
                </div>
                <div className='conversation-overview-info-container-bottom'>
                    {
                        (isTyping.includes(String(_id)) && Object.keys(typingChatIds).includes(String(_id))) || (isRecording.includes(String(_id)) && Object.keys(recordingChatIds).includes(String(_id)))
                        ?
                        <span style={{color:'green'}}>
                            {
                                isTyping.includes(String(_id))
                                ?
                                    isGrp
                                    ?
                                    typingChatIds[String(_id)] +' is typing...'
                                    :
                                    <>
                                    typing...
                                    </>
                                :
                                    isGrp
                                    ?
                                    recordingChatIds[String(_id)] +' is recording audio...'
                                    :
                                    <>
                                    recording audio...
                                    </>
                            }
                        </span>
                        :
                        <span style={newMessagesAvailable ? {color:'black'} : null}> 
                            {
                                lastMessage
                                ?
                                parse(lastMessage)
                                :
                                ''
                            } 
                        </span>
                    }
                    {
                        newMessagesAvailable
                        ?
                        <i className="fas fa-circle" style={{color:'red', fontSize:15, position: 'absolute', bottom: 0, right:0}}></i>
                        :
                        !isGrp && <i className="fas fa-chevron-down" onClick={toggleDeleteVisibility}></i>                     
                    }
                    {
                        showChatDelete && <motion.button className='delete-chat' onClick={()=>deleteChat(_id)} disabled={showLoader}
                            initial={{scale:0}}
                            animate={{scale:1}}
                        >
                            {
                                showLoader
                                ?
                                <>
                                    <img src='/images/spiner2.gif' alt='loader' />
                                    <div></div>
                                </>
                                :
                                <>
                                    Delete chat
                                    <div></div>
                                </>

                            
                            }
                        </motion.button>
                    }
                </div>
            </div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default ConversationOverview;