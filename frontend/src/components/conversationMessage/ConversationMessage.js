import React, { useContext } from 'react';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './conversationMessage.css';





// Style for loggedIn user's message
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
    const [, , user, , , , , , , , , , , , , selectedConversationInfo] = useContext(Context);


    let time = new Date(createdAt).toLocaleTimeString();
    let formatedTime = time.slice(0, time.length - 6) + time.slice(time.length-3);

    return(
        <div className='conversation-message-wrapper' style={messageMediaType==='notification' ? {justifyContent:'center'} : user._id===messageSender._id ? {justifyContent:'flex-end'} : null}>
            <div className='conversation-message' style={messageMediaType==='notification' ? {paddingBottom:'8px', padding:10, background:'#ffeecd'} : user._id===messageSender._id ? myMessageStyle : null}>
                {
                    messageMediaType!=='notification' && <div className='message-indicator' style={user._id===messageSender._id ? myMessageIndicatorStyle : null} ></div>
                }
                {
                    (messageMediaType!=='notification' && user._id!==messageSender._id && Boolean(selectedConversationInfo.isGrp)) && <h5 style={{textAlign:'left'}}>
                        {formatName(messageSender.name)}
                    </h5>
                }
                {
                    (messageMediaType==='img') && <div className='message-image-wrapper'>
                        <img src={messageMedia} alt='chatImage' />
                    </div>
                }
                {
                    text && <p style={messageMediaType==='notification' ? {color:'#54656f', fontSize:'14px'} : user._id===messageSender._id ? {color:'white'} : null}> {text} </p>
                }
                {
                    (messageMediaType==='aud') && <audio controls id={user._id===messageSender._id ? 'my-audio-message' : null} >
                        <source src={messageMedia} type='audio/mpeg'></source>
                    </audio>
                }
                {
                    messageMediaType!=='notification' && <span style={user._id===messageSender._id ? {color:'white'} : null}> {formatedTime} </span>
                }
            </div>
        </div>
    );
}

export default ConversationMessage;