import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import Context from '../../context/Context';
import './conversationHeader.css';

const ConversationHeader = ( { setShowUpdateGrp, setShowConversation, selectedConversationInfo } )=>{
    const { users, isGrp } = selectedConversationInfo;

    // getting values & methods from global state
    const [, , user] = useContext(Context);

    return(
        <div className='conversation-header'>
            <div className='back-and-chat-name'>
                <motion.i className="fas fa-arrow-left chat-back-btn" onClick={()=>setShowConversation(false)}
                    initial={{background:'rgb(76, 180, 158)'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                ></motion.i>
                <span>
                    <img src={user._id===users[0]._id ? users[1].profileImage : users[0].profileImage} alt='avatar' />
                    <div>
                        <p>
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
                        <span>last seen yesterday at 11:00 PM</span>
                    </div>
                </span>
            </div>
            {
                isGrp && <motion.i className="fas fa-eye view-grp-details-btn" onClick={()=>setShowUpdateGrp(true)}
                    initial={{background:'rgb(76, 180, 158)'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                ></motion.i>
            }
        </div>
    );
}

export default ConversationHeader;