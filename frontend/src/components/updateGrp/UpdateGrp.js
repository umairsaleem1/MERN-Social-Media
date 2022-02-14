import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GrpSettings from '../grpSettings/GrpSettings';
import UpdateGrpParticipant from '../updateGrpParticipant/UpdateGrpParticipant';
import './updateGrp.css'; 

const UpdateGrp = ( { setShowUpdateGrp } )=>{
    // state to show or hide the emoji picker for update group subject
    const [showPicker1, setShowPicker1] = useState(false);
    // state to show or hide the emoji picker for update group description
    const [showPicker2, setShowPicker2] = useState(false);
    // state to show or hide inputBox for updating group subject
    const [showUpdateGrpSubjectInput, setShowUpdateGrpSubjectInput] = useState(false);
    // state to show or hide inputBox for updating group subject
    const [showUpdateGrpDescInput, setShowUpdateGrpDescInput] = useState(false);
    // state to show or hide grp settings component
    const [showGrpSettings, setShowGrpSettings] = useState(false);



    return(
        <motion.div className='update-grp-container'
            initial={{x:'100%'}}
            animate={{x:0}}
            transition={{type:'tween'}}
        >
            <div className='update-grp-header'>
                <motion.span className='update-grp-cancel' onClick={()=>setShowUpdateGrp(false)} title='Close'
                    initial={{background:'rgb(76, 180, 158)'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <path fill="currentColor" d="m19.1 17.2-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.4-5.3-5.3-1.8 1.7 5.3 5.3-5.3 5.3L6.7 19l5.3-5.3 5.3 5.3 1.8-1.8z"></path>
                    </svg>
                </motion.span>
                <h3>Group info</h3>
            </div>

            <div className='update-grp-info-container'>
                <form>
                    <div className='update-grp-image-container'>
                        <img src='/images/sociallogo.png' alt='grpIcon' />
                        <div className='update-grp-image' title='Update icon'>
                            <i className="fas fa-camera"></i>
                            <input type='file' accept='image/*' />
                        </div>
                    </div>
                    {
                        showUpdateGrpSubjectInput
                        ?
                        <div className='update-grp-input-wrapper'>
                            <i className="far fa-grin" title='Open emoji picker' onClick={()=>setShowPicker1(!showPicker1)} style={showPicker1 ? {background:'#d1e1ff'} : null}></i>
                            <input type='text' />
                            <span title='Click to save' onClick={()=>setShowUpdateGrpSubjectInput(false)}>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m9 17.2-4-4-1.4 1.3L9 19.9 20.4 8.5 19 7.1 9 17.2z"></path></svg>
                            </span>
                        </div>
                        :
                        <h2 className='update-grp-name'>BS Software Engineering <i className="fas fa-pencil-alt" title='Click to edit' onClick={()=>setShowUpdateGrpSubjectInput(true)}></i></h2>
                    }
                    <p className='grp-participants'>Group - 2 participants</p>
                </form>


                <div className='grp-desc-and-date' style={showUpdateGrpDescInput ? {padding:'20px'} : null}>
                    {
                        showUpdateGrpDescInput
                        ?
                        <div className='update-grp-input-wrapper' style={{marginTop:'0px'}}>
                            <i className="far fa-grin" title='Open emoji picker' onClick={()=>setShowPicker2(!showPicker2)} style={showPicker2 ? {background:'#d1e1ff'} : null}></i>
                            <input type='text' style={{fontSize:'16px'}} />
                            <span title='Click to save' onClick={()=>setShowUpdateGrpDescInput(false)}>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m9 17.2-4-4-1.4 1.3L9 19.9 20.4 8.5 19 7.1 9 17.2z"></path></svg>
                            </span>
                        </div>
                        :
                        <p className='desc'>This is description <i className="fas fa-pencil-alt" title='Click to edit' onClick={()=>setShowUpdateGrpDescInput(true)}></i></p>
                    }
                    <p className='date' style={showUpdateGrpDescInput ? {padding:'0px'} : null}>Created by me at 10:00 PM</p>
                </div>


                <div className='grp-settings-wrapper' onClick={()=>setShowGrpSettings(true)}>
                    <i className="fas fa-cog settings-icon"></i>
                    <p>Group Settings</p>
                    <i className="fas fa-chevron-right arrow-icon"></i>
                </div>


                <div className='grp-participants-wrapper'>
                    <p className='participants-count'>2 participants</p>
                    <div className='update-grp-add-participant'>
                        <div className='update-grp-add-participant-icon'>
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14.7 12c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6-3.6 1.6-3.6 3.6 1.6 3.6 3.6 3.6zm-8.1-1.8V7.5H4.8v2.7H2.1V12h2.7v2.7h1.8V12h2.7v-1.8H6.6zm8.1 3.6c-2.4 0-7.2 1.2-7.2 3.6v1.8H22v-1.8c-.1-2.4-4.9-3.6-7.3-3.6z"></path></svg>
                        </div>
                        <p>Add participant</p>
                    </div>


                    <div className='update-grp-participants-list'>
                        <UpdateGrpParticipant/>
                        <UpdateGrpParticipant/>
                    </div>
                </div>


                <div className='update-grp-exit'>
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m16.6 8.1 1.2-1.2 5.1 5.1-5.1 5.1-1.2-1.2 3-3H8.7v-1.8h10.9l-3-3zM3.8 19.9h9.1c1 0 1.8-.8 1.8-1.8v-1.4h-1.8v1.4H3.8V5.8h9.1v1.4h1.8V5.8c0-1-.8-1.8-1.8-1.8H3.8C2.8 4 2 4.8 2 5.8v12.4c0 .9.8 1.7 1.8 1.7z"></path></svg>
                    <p>Exit group</p>
                </div>
            </div>


            {
                showGrpSettings && <GrpSettings setShowGrpSettings={setShowGrpSettings}/>
            }
        </motion.div>
    );
}

export default UpdateGrp;