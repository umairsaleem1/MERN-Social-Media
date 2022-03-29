import React, { useState, useEffect, useContext, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ConversationMessage from '../conversationMessage/ConversationMessage';
import SendMessage from '../sendMessage/SendMessage';
import ImageMessagePreview from '../imageMessagePreview/ImageMessagePreview';
import Context from '../../context/Context';
import './conversationMessages.css';  
import 'react-toastify/dist/ReactToastify.css';

const ConversationMessages = ( )=>{

    // getting values & methods from global state 
    const [, , user, , , , , , , , , , , selectedConversationId, , selectedConversationInfo, , , , messages, setMessages, , , , , , , , , , , , , , , messagesNotifications, setMessagesNotifications] = useContext(Context);

    // ######## States for text/image send component #########

    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState();


    const [showLoader, setShowLoader] = useState(false);
    





    useEffect(()=>{
        const notification = messagesNotifications.reverse().find((msgNotification)=>{
            return msgNotification.notificationChatId===selectedConversationId;
        })
        // console.log(notification)
        // function to mark the lastest(newest)(single) messages notification of this user as viewed(true)
        const updateClickedMessagesNotification = async ()=>{
            try{
                const res = await fetch(`/notifications/${selectedConversationId}?&type=${"message"}`, {
                    method: 'PUT',
                    credentials: 'include'
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                await res.json();

                setMessagesNotifications((prevMessagesNotifications)=>{

                    let arr = prevMessagesNotifications.filter((notif)=>{
                        return notif.notificationChatId!==selectedConversationId;
                    })
                    return arr;
                })

            }catch(e){
                console.log(e);
            }
        }

        
        if(notification && notification.messageNotificationReceivers.includes(user._id)){
            updateClickedMessagesNotification();
        }

    }, [messagesNotifications, selectedConversationId, setMessagesNotifications, user._id])




    // useEffect to fetch Conversation Messages when the component is rendered
    useEffect(()=>{
        const fetchMessages = async ()=>{
            setShowLoader(true);
            try{
                const res = await fetch(`/messages/${selectedConversationId}`);

                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setMessages(data.chat.messages);
                setShowLoader(false);

            }catch(e){
                setShowLoader(false);
                toast.error('Oops! some problem occurred', {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(e);
            }
        }
        fetchMessages();


    }, [selectedConversationId, setMessages]);

    // scrolling to bottom of conversationMessages when messages state changes
    useEffect(()=>{
        conversationMessagesRef.current.scrollTo({top:conversationMessagesRef.current.scrollHeight, left:0});
    }, [messages, selectedConversationId])


    
    const conversationMessagesRef = useRef();




    return(
        <>
        <div className='conversation-messages-wrapper'>
            <div className='conversation-messages' ref={conversationMessagesRef}>
                {
                    messages.length
                    ?
                    [
                        ...new Map(messages.map((item)=>[item["_id"], item])).values()
                    ].map((message)=>{
                        return <ConversationMessage key={message._id} message={message}/>
                    })
                    :
                        showLoader
                        ?
                        <img src='/images/spiner2.gif' className='conversation-loader' alt='loader' />
                        :
                        null 
                }
            </div>
            {
                Boolean(selectedConversationInfo.isGrp)
                ?
                    selectedConversationInfo.grpSendMessages==='all'
                    ?
                    <SendMessage selectedFile={selectedFile} setSelectedFile={setSelectedFile} setPreview={setPreview} message={message} setMessage={setMessage}/>
                    :
                        selectedConversationInfo.grpAdmins.includes(user._id)
                        ?
                        <SendMessage selectedFile={selectedFile} setSelectedFile={setSelectedFile} setPreview={setPreview} message={message} setMessage={setMessage}/>
                        :
                        <div className='only-admins-can-send-messages'>Only admins can send messages</div>
                :
                <SendMessage selectedFile={selectedFile} setSelectedFile={setSelectedFile} setPreview={setPreview} message={message} setMessage={setMessage}/>
            }
            {
                preview && <ImageMessagePreview selectedFile={selectedFile} setSelectedFile={setSelectedFile} preview={preview} setPreview={setPreview} message={message} setMessage={setMessage}/>
            }
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default ConversationMessages;