import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useClickOutside } from '../../utils/useClickOutside';
import Context from '../../context/Context';
import './updateGrpParticipant.css';

const UpdateGrpParticipant = ( { grpUser, grpAdmins, grpSubject, users } )=>{

    // getting values & methods from global state
    const [, , user, , , , socketRef, , , , , , , , , selectedConversationInfo, setSelectedConversationInfo, chats, setChats, messages, setMessages] = useContext(Context);


    // state to show or hide options list when clicked on participant's arrow in update Grp component's participants list individual participant
    const [showParticipantOptions, setShowParticipantOptions] = useState(false);

    const [showToggleAdminModal, setShowToggleAdminModal] = useState(false);

    const [toggleAdminModalText, setToggleAdminModalText] = useState('');

    const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);

    const [showRemoveUserLoader, setShowRemoveUserLoader] = useState(false);


    // using cutom hook useClickOutside
    const participantOptionsModal = useClickOutside(()=>{
        setShowParticipantOptions(false);
    }, true);

    // using cutom hook useClickOutside
    const removeUserModal = useClickOutside(()=>{
        setShowRemoveUserModal(false);
    }, true);












    // handler that will be called when clicked on any listed participants
    const handleParticipantClick = ()=>{
        // if participant is itself who clicked or the user is not an admin of the group who clicked on participant, then do nothing
        if(grpUser._id===user._id || !grpAdmins.includes(user._id)){
            return;
        }
        setTimeout(()=>{
            setShowParticipantOptions(true);
        }, 200)
    }


    // handler that will be called when user clicks on make an admim or dismiss as admin
    const toggleAdmin = async (makeAdmin)=>{
        if(makeAdmin){
            setToggleAdminModalText('Adding...');

            setTimeout(()=>{
                setShowParticipantOptions(false);
                setShowToggleAdminModal(true);
            }, 200)

            try{

                let formData = new FormData();
                formData.append('addAdminId', grpUser._id);
                formData.append('addAdminName', grpUser.name);


                const res = await fetch(`chats/${selectedConversationInfo._id}?type=makeGrpAdmin`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                })
    
                if(!res.ok){
                    throw new Error(res.statusText);
                }
    
                const data = await res.json();


                let updatedChats = chats.filter((cht)=>{
                    return cht._id!==data.updatedChat._id;
                })
                updatedChats.unshift(data.updatedChat)

                let updatedGrpAdmins = grpAdmins;
                updatedGrpAdmins.push(grpUser._id);

                const updatedSelectedConversationInfo = {...selectedConversationInfo, grpAdmins: updatedGrpAdmins};


                const newMessage = {
                    _id: new Date(Date.now()),
                    text: data.updatedChat.lastMessage,
                    messageMedia: '',
                    messageMediaType: 'notification',
                    cloudinaryId: ''
                }

                // reseting values
                setChats(updatedChats);
                setSelectedConversationInfo(updatedSelectedConversationInfo)
                setMessages([...messages, newMessage]);
                setShowToggleAdminModal(false);


                // emiting grpAddAdminsUpdate event to notify all connected socket about this update
                socketRef.current.emit('grpAddAdminsUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage, updatedSelectedConversationInfo);

            }catch(e){
                setShowToggleAdminModal(false);
                console.log(e);
            }

        }else{
            setToggleAdminModalText('Removing...');

            setTimeout(()=>{
                setShowParticipantOptions(false);
                setShowToggleAdminModal(true);
            }, 200)

            try{

                let formData = new FormData();
                formData.append('removeAdminId', grpUser._id);
                formData.append('removeAdminName', grpUser.name);


                const res = await fetch(`chats/${selectedConversationInfo._id}?type=dismissGrpAdmin`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                })
    
                if(!res.ok){
                    throw new Error(res.statusText);
                }
    
                const data = await res.json();


                let updatedChats = chats.filter((cht)=>{
                    return cht._id!==data.updatedChat._id;
                })
                updatedChats.unshift(data.updatedChat)

                let updatedGrpAdmins = grpAdmins.filter((updatedGrpAdminId)=>{
                    return updatedGrpAdminId!==grpUser._id
                });

                const updatedSelectedConversationInfo = {...selectedConversationInfo, grpAdmins: updatedGrpAdmins};


                const newMessage = {
                    _id: new Date(Date.now()),
                    text: data.updatedChat.lastMessage,
                    messageMedia: '',
                    messageMediaType: 'notification',
                    cloudinaryId: ''
                }

                // reseting values
                setChats(updatedChats);
                setSelectedConversationInfo(updatedSelectedConversationInfo)
                setMessages([...messages, newMessage]);
                setShowToggleAdminModal(false);


                // emiting grpDismissAdminsUpdate event to notify all connected socket about this update
                socketRef.current.emit('grpDismissAdminsUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage, updatedSelectedConversationInfo);

            }catch(e){
                setShowToggleAdminModal(false);
                console.log(e);
            }
        }
    }



    const handleRemoveUserClick = ()=>{
        setTimeout(()=>{
            setShowParticipantOptions(false);
            setShowRemoveUserModal(true);
        }, 200)
    }

    const handleRemoveUserConfirmClick = async ()=>{
        setShowRemoveUserLoader(true);
        try{
            const formatedName = user.name.split(' ').map((item)=>{
                return item[0].toUpperCase()+item.slice(1)
            }).join(' ');


            let formData = new FormData();
            formData.append('removeParticipantId', grpUser._id);
            formData.append('removeParticipantName', grpUser.name);
            formData.append('changedBy', formatedName);


            const res = await fetch(`chats/${selectedConversationInfo._id}?type=removeGrpParticipant`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })
    
            if(!res.ok){
                throw new Error(res.statusText);
            }
    
            const data = await res.json();


            let updatedChats = chats.filter((cht)=>{
                return cht._id!==data.updatedChat._id;
            })
            updatedChats.unshift(data.updatedChat)

            let updatedGrpAdmins = grpAdmins.filter((updatedGrpAdminId)=>{
                return updatedGrpAdminId!==grpUser._id
            });
            let updatedGrpUsers = users.filter((updatedGrpUser)=>{
                return updatedGrpUser._id!==grpUser._id
            })

            const updatedSelectedConversationInfo = {...selectedConversationInfo, grpAdmins: updatedGrpAdmins, users: updatedGrpUsers};


            const newMessage = {
                _id: new Date(Date.now()),
                text: data.updatedChat.lastMessage,
                messageMedia: '',
                messageMediaType: 'notification',
                cloudinaryId: ''
            }

            // reseting values
            setChats(updatedChats);
            setSelectedConversationInfo(updatedSelectedConversationInfo)
            setMessages([...messages, newMessage]);
            setShowRemoveUserLoader(false);
            setShowRemoveUserModal(false);


            // emiting removeParticipantUpdate event to notify all connected socket about this update
            socketRef.current.emit('removeParticipantUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage, updatedSelectedConversationInfo, grpUser._id);

        }catch(e){
            setShowRemoveUserLoader(false);
            setShowRemoveUserModal(false);
            console.log(e);
        }
    }
    return(
        <>
        <motion.div className='update-grp-participant' key={grpUser._id} onClick={handleParticipantClick}
            initial={{background:'#fff'}}
            whileHover={{background:'#f5f6f6'}}
            whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
        >
            <img src={grpUser.profileImage} alt='userAvatar' />
            <p>
            {
                grpUser.name.split(' ').map((item)=>{
                    return item[0].toUpperCase()+item.slice(1)
                }).join(' ')
            }
            </p>
            {
                grpAdmins.includes(grpUser._id) && <div className='grp-admin-tag'>Group admin</div>
            }

        </motion.div>

        <div className='update-grp-participant-options-container' style={showParticipantOptions ? null : {display:'none'}}>
            <motion.div className='update-grp-participant-options' ref={participantOptionsModal}
                initial={{scale:0}}
                animate={{scale:1}}                 
                transition={{delay:0.2}}
            >
                {
                    grpAdmins.includes(grpUser._id)                    
                    ?
                    <motion.div onClick={()=>toggleAdmin()}
                        initial={{background:'#fff'}}
                        whileHover={{background:'#f5f6f6'}}
                        whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                    >Dismiss as admin</motion.div>
                    :
                    <motion.div onClick={()=>toggleAdmin(true)}
                        initial={{background:'#fff'}}
                        whileHover={{background:'#f5f6f6'}}
                        whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                    >Make group admin</motion.div>
                }
                <motion.div onClick={handleRemoveUserClick}
                    initial={{background:'#fff'}}
                    whileHover={{background:'#f5f6f6'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >Remove</motion.div>
            </motion.div>
        </div>

        <div className='toggle-admin-modal-container' style={showToggleAdminModal ? null : {display:'none'}}>
            <div className='toggle-admin-modal'>
                <h2> {toggleAdminModalText} </h2>
                <div>
                    <img src='/images/spiner2.gif' alt='loader' />
                    <span>Please wait a moment</span>
                </div>
            </div>
        </div>

        <div className='remove-user-modal-container' style={showRemoveUserModal ? null : {display:'none'}}>
            <div className='remove-user-modal' ref={removeUserModal}>
                <p>Remove {grpUser.name.split(' ').map((item)=> item[0].toUpperCase()+item.slice(1)).join(' ')} from "{grpSubject}" group?</p>
                <div className='remove-user-modal-btns'>
                    <button className='cancel-btn' onClick={()=>setShowRemoveUserModal(false)}>Cancel</button>
                    <button className='confirm-btn' onClick={handleRemoveUserConfirmClick} disabled={showRemoveUserLoader}>
                        {
                            showRemoveUserLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loadder'/>
                            :
                            <>
                            Confirm
                            </>
                        }
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}

export default UpdateGrpParticipant;