import React, {useState, useEffect, useContext} from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import { ToastContainer, toast } from 'react-toastify';
import Context from '../../context/Context';
import './conversationOverview.css';
import 'react-toastify/dist/ReactToastify.css';

const ConversationOverview = ( { showConversation, setShowConversation, selectedConversationId, setSelectedConversationId, setSelectedConversationInfo, chat, setMessages, socket, chats, setChats } )=>{
    const { _id, users, lastMessage, lastMessageDate } = chat;

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


     // getting values & methods from global state
     const [, , user] = useContext(Context);


    // joining all the rooms of user's chat history when the messages page is rendered so that we can listen for new messages from all rooms
    useEffect(()=>{
        if(socket){
            socket.emit('join-chat', String(_id));
        }
    }, [socket, _id])


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
                <img src={user._id===users[0]._id ? users[1].profileImage : users[0].profileImage} alt='avatar' />
            </div>
            <div className='conversation-overview-info-container'>
                <div className='conversation-overview-info-container-top'>
                    <p style={!lastMessage ? {marginTop:'13px'} : null}> 
                        {
                            user._id===users[0]._id
                            ?
                            users[1].name.split(' ').map((item)=>{
                                return item[0].toUpperCase()+item.slice(1)
                            }).join(' ')
                            :
                            users[0].name.split(' ').map((item)=>{
                                return item[0].toUpperCase()+item.slice(1)
                            }).join(' ')
                        }
                    </p>
                    {
                        lastMessageDate && <span> {formatedDate} </span>
                    }
                </div>
                <div className='conversation-overview-info-container-bottom'>
                    <span> 
                        {
                            lastMessage
                            ?
                            parse(lastMessage)
                            :
                            ''
                        } 
                    </span>
                    <i className="fas fa-chevron-down" onClick={toggleDeleteVisibility}></i>
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