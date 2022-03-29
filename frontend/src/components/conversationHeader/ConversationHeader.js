import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './conversationHeader.css';

const ConversationHeader = ( { setShowUpdateGrp, setShowConversation } )=>{

    // getting values & methods from global state
    const [, , user, , , , , onlineUsers , , isTyping, , typingChatIds, , , setSelectedConversationId, selectedConversationInfo, , , , , , isRecording, , recordingChatIds] = useContext(Context);

    const { _id, users, isGrp, grpAvatar, grpSubject } = selectedConversationInfo;


    const handleConversationMessagesBackBtn = ()=>{
        setShowConversation(false);
        setSelectedConversationId(null);
    }

    return(
        <div className='conversation-header'>
            <div className='back-and-chat-name'>
                <motion.i className="fas fa-arrow-left chat-back-btn" onClick={handleConversationMessagesBackBtn}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                ></motion.i>
                <span> 
                    {
                        isGrp
                        ?
                        <img src={grpAvatar ? grpAvatar : '/images/grpPlaceholder.png'} alt='grpAvatar' />
                        :
                        <img src={user._id===users[0]._id ? users[1].profileImage : users[0].profileImage} alt='avatar' />
                    }
                    <div>
                        <p>
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
                            <span> 
                                {
                                    isGrp
                                    ?
                                    users.map((user, ind)=>{
                                        let n = user.name.split(' ')[0];
                                        if(ind===users.length-1){
                                            return `${n[0].toUpperCase()}${n.slice(1)}`
                                        }else{
                                            return `${n[0].toUpperCase()}${n.slice(1)}, `
                                        }
                                    })
                                    :
                                    user._id===users[0]._id 
                                    ?
                                        onlineUsers.includes(String(users[1]._id))
                                        ?
                                        <> 
                                        <i className="fas fa-circle" style={{color:'green', marginRight:7, fontSize:10}}></i>
                                        Active now
                                        </>
                                        :
                                        'Offline'
                                    :
                                        onlineUsers.includes(String(users[0]._id))
                                        ?
                                        <>
                                        <i className="fas fa-circle" style={{color:'green', marginRight:7, fontSize:10}}></i>
                                        Active now
                                        </>
                                        :
                                        'Offline'
                                }
                            </span>
                        }
                    </div>
                </span>
            </div>
            {
                isGrp && <motion.i className="fas fa-eye view-grp-details-btn" onClick={()=>setShowUpdateGrp(true)}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                ></motion.i>
            }
        </div>
    );
}

export default ConversationHeader;