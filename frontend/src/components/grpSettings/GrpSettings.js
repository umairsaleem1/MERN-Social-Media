import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EditGrpSettingsModal from '../editGrpSettingsModal/EditGrpSettingsModal';
import './grpSettings.css';

const GrpSettings = ( { setShowGrpSettings, grpSendMessages, grpEditInfo } )=>{
    
    // getting values & methods from global state
    // const [, , , , , , socketRef, , , , , , , , , selectedConversationInfo, setSelectedConversationInfo, chats, setChats, messages, setMessages] = useContext(Context);


    // state to show or hide Grp Info settings modal
    const [showInfoModal, setShowInfoModal] = useState(false);
    // state to show or hide Grp Messages settings modal
    const [showMessagesModal, setShowMessagesModal] = useState(false);

    return(
        <motion.div className='grp-settings-container'  
            initial={{x:'100%'}}
            animate={{x:0}}
            transition={{type:'tween'}}
        >
            <div className='grp-settings-header'>
                <motion.div className='grp-settings-back' onClick={()=>setShowGrpSettings(false)}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <i className="fas fa-arrow-left"></i>
                </motion.div>
                <h3>Group settings</h3>
            </div>


            <div className='grp-settings'>
                <motion.div className='edit-grp-info-authority' onClick={()=>setTimeout(()=>setShowInfoModal(true), 200)}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <p>Edit group info</p>
                    {
                        grpEditInfo==='all'
                        ?
                        <span>All participants</span>
                        :
                        <span>Only admins</span>
                    }
                </motion.div>

                <div className='edit-grp-info-authority-desc'>
                    <p>Choose who can change this group's subject, icon and description setting.</p>
                </div>

                <motion.div className='send-messages-authority' onClick={()=>setTimeout(()=>setShowMessagesModal(true), 200)}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <p>Send messages</p>
                    {
                        grpSendMessages==='all'
                        ?
                        <span>All participants</span>
                        :
                        <span>Only admins</span>
                    }
                </motion.div>

            </div>


            {
                showInfoModal && <EditGrpSettingsModal setShowModal={setShowInfoModal} title='Edit group info' setting={grpEditInfo} fromInfo={true}/>
            }
            {
                showMessagesModal && <EditGrpSettingsModal setShowModal={setShowMessagesModal} title='Send messages' setting={grpSendMessages} />
            }
        </motion.div>
    );
}

export default GrpSettings;