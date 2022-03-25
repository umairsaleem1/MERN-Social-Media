import React, { useContext } from 'react';
import Context from '../../context/Context';
import './conversationMessage.css';





// Style from loggedIn user's message
const myMessageStyle = {
    background: '#1B74E4'
}
const myMessageIndicatorStyle = {
    transform: 'skew(-40deg)',
    marginLeft: 'calc(100% - 5px)',
    background: '#1B74E4'
}

const ConversationMessage = ( { message } )=>{
    const { text, messageMedia, messageMediaType, messageSender, createdAt } = message;

    // getting values & methods from global state
    const [, , user] = useContext(Context);


    let time = new Date(createdAt).toLocaleTimeString();
    let formatedTime = time.slice(0, time.length - 6) + time.slice(time.length-3);

    return(
        <div className='conversation-message-wrapper' style={messageMediaType==='notification' ? {justifyContent:'center'} : user._id===messageSender ? {justifyContent:'flex-end'} : null}>
            <div className='conversation-message' style={messageMediaType==='notification' ? {paddingBottom:'8px', padding:10, background:'#ffeecd'} : user._id===messageSender ? myMessageStyle : null}>
                {
                    messageMediaType!=='notification' && <div className='message-indicator' style={user._id===messageSender ? myMessageIndicatorStyle : null} ></div>
                }
                {
                    (messageMediaType==='img') && <div className='message-image-wrapper'>
                        <img src={messageMedia} alt='chatImage' />
                    </div>
                }
                {
                    text && <p style={messageMediaType==='notification' ? {color:'#54656f', fontSize:'14px'} : user._id===messageSender ? {color:'white'} : null}> {text} </p>
                }
                {
                    (messageMediaType==='aud') && <audio controls id={user._id===messageSender ? 'my-audio-message' : null} >
                        <source src={messageMedia} type='audio/mpeg'></source>
                    </audio>
                }
                {
                    messageMediaType!=='notification' && <span style={user._id===messageSender ? {color:'white'} : null}> {formatedTime} </span>
                }
            </div>
        </div>
    );
}

export default ConversationMessage;