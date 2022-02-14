import React, { useContext } from 'react';
import Context from '../../context/Context';
import './conversationMessage.css';





// Style from loggedIn user's message
const myMessageStyle = {
    background: '#d9fdd3'
}
const myMessageIndicatorStyle = {
    transform: 'skew(-40deg)',
    marginLeft: 'calc(100% - 5px)',
    background: '#d9fdd3'
}

const ConversationMessage = ( { message } )=>{
    const { text, messageMedia, messageMediaType, messageSender, createdAt } = message;

    // getting values & methods from global state
    const [, , user] = useContext(Context);


    let time = new Date(createdAt).toLocaleTimeString();
    let formatedTime = time.slice(0, time.length - 6) + time.slice(time.length-3);

    return(
        <div className='conversation-message-wrapper' style={user._id===messageSender ? {justifyContent:'flex-end'} : null}>
            <div className='conversation-message' style={user._id===messageSender ? myMessageStyle : null}>
                <div className='message-indicator' style={user._id===messageSender ? myMessageIndicatorStyle : null} ></div>
                {
                    (messageMediaType==='img') && <div className='message-image-wrapper'>
                        <img src={messageMedia} alt='chatImage' />
                    </div>
                }
                {
                    text && <p> {text} </p>
                }
                {
                    (messageMediaType==='aud') && <audio controls id={user._id===messageSender ? 'my-audio-message' : null} >
                        <source src={messageMedia} type='audio/mpeg'></source>
                    </audio>
                }
                <span> {formatedTime} </span>
            </div>
        </div>
    );
}

export default ConversationMessage;