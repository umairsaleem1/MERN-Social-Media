import React from 'react';
import { motion } from 'framer-motion';
import './editGrpSettingsModal.css';

const EditGrpSettingsModal = ( { setShowModal, title, fromInfo } )=>{
    return(
        <div className='edit-grp-settings-modal-container'>
            <motion.div className='edit-grp-settings-modal'
                initial={{scale:0}}
                animate={{scale:1}}
                transition={{delay:0.2}}
            >
                <p> {title} </p>
                {
                    fromInfo && <span>Choose who can change this group's subject, icon and description setting.</span>
                }
                <form>
                    <div style={{marginBottom:'10px'}}>
                        <input type='radio' id='all-participants' name='permissions' value='all' /><label htmlFor='all-participants'>All participants</label>
                    </div>
                    <div>
                        <input type='radio' id='only-admins' name='permissions' value='admins' /><label htmlFor='only-admins'>Only admins</label>
                    </div>
                </form>
                <div className='edit-grp-settings-modal-btns'>
                    <button className='cancel-btn' onClick={()=>setShowModal(false)}>Cancel</button>
                    <button className='confirm-btn'>Confirm</button>
                </div>
            </motion.div>
        </div>
    );
}

export default EditGrpSettingsModal;