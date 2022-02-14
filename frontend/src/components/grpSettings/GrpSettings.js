import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EditGrpSettingsModal from '../editGrpSettingsModal/EditGrpSettingsModal';
import './grpSettings.css';

const GrpSettings = ( { setShowGrpSettings } )=>{
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
                    initial={{background:'rgb(76, 180, 158)'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <i className="fas fa-arrow-left"></i>
                </motion.div>
                <h3>Group settings</h3>
            </div>


            <div className='grp-settings'>
                <div className='edit-grp-info-authority' onClick={()=>setShowInfoModal(true)}>
                    <p>Edit group info</p>
                    <span>All participants</span>
                </div>

                <div className='edit-grp-info-authority-desc'>
                    <p>Choose who can change this group's subject, icon and description setting.</p>
                </div>

                <div className='send-messages-authority' onClick={()=>setShowMessagesModal(true)}>
                    <p>Send messages</p>
                    <span>All participants</span>
                </div>

                <div className='edit-grp-admins-authority'>
                    <p>Edit group admins</p>
                </div>
            </div>


            {
                showInfoModal && <EditGrpSettingsModal setShowModal={setShowInfoModal} title='Edit group info' fromInfo={true}/>
            }
            {
                showMessagesModal && <EditGrpSettingsModal setShowModal={setShowMessagesModal} title='Send messages'/>
            }
        </motion.div>
    );
}

export default GrpSettings;