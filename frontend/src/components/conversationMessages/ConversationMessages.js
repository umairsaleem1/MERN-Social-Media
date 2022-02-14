import React, { useState, useEffect, useRef } from 'react';
import ConversationMessage from '../conversationMessage/ConversationMessage';
import SendMessage from '../sendMessage/SendMessage';
import ImageMessagePreview from '../imageMessagePreview/ImageMessagePreview';
import './conversationMessages.css';  

const ConversationMessages = ( { selectedConversationId, setChats, messages, setMessages, socket } )=>{

    // ######## States for text/image send component #########

    // state that will contain text input field value of message to send
    const [message, setMessage] = useState('');
    // selectedFile will contain the file that is selected to send
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();

    



    // useEffect to fetch Conversation Messages when the component is rendered
    useEffect(()=>{
        const fetchMessages = async ()=>{
            try{
                const res = await fetch(`/messages/${selectedConversationId}`);

                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setMessages(data.chat.messages);

            }catch(e){
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
                    null
                }
            </div>
            <SendMessage selectedFile={selectedFile} setSelectedFile={setSelectedFile} setPreview={setPreview} message={message} setMessage={setMessage} selectedConversationId ={selectedConversationId} setMessages={setMessages} socket={socket} setChats={setChats}/>
            {
                preview && <ImageMessagePreview selectedFile={selectedFile} setSelectedFile={setSelectedFile} preview={preview} setPreview={setPreview} message={message} setMessage={setMessage} selectedConversationId ={selectedConversationId} setMessages={setMessages} socket={socket} setChats={setChats}/>
            }
        </div>
    );
}

export default ConversationMessages;