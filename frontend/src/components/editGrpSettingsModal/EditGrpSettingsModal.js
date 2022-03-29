import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { useClickOutside } from '../../utils/useClickOutside';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './editGrpSettingsModal.css';
import 'react-toastify/dist/ReactToastify.css';

const EditGrpSettingsModal = ( { setShowModal, title, setting, fromInfo } )=>{
    
    // getting values & methods from global state
    const [, , user, , , , socketRef, , , , , , , , , selectedConversationInfo, setSelectedConversationInfo, chats, setChats, messages, setMessages] = useContext(Context);

    
    const [permissions, setPermissions] = useState(setting);
    const [showLoader, setShowLoader] = useState(false);


    // using cutom hook useClickOutside
    const modal = useClickOutside(()=>{
        setShowModal(false);
    }, true);



    const changePermissions = async ()=>{
        // if the user does not change permissions(same as was previous)
        if(permissions===setting){
            setShowModal(false);
            return;
        }

        const formatedName = formatName(user.name);


        setShowLoader(true);
        try{
            if(fromInfo){
                let formData = new FormData();
                formData.append('grpEditInfo', permissions);
                formData.append('changedBy', formatedName)

                const res = await fetch(`chats/${selectedConversationInfo._id}?type=grpEditInfo`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                const data = await res.json();

                let modifiedChat;
                let updatedChats = chats.filter((cht)=>{

                    if(cht._id===data.updatedChat._id){
                        const { grpEditInfo, lastMessage, lastMessageDate } = data.updatedChat;
                        modifiedChat = {...cht, grpEditInfo:grpEditInfo, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                        return false;
                    }else{
                        return true;
                    }
                })
                updatedChats.unshift(modifiedChat);


                const newMessage = {
                    _id: new Date(Date.now()),
                    text: data.updatedChat.lastMessage,
                    messageMedia: '',
                    messageMediaType: 'notification',
                    cloudinaryId: ''
                }

                // reseting values
                setChats(updatedChats);
                setSelectedConversationInfo({...selectedConversationInfo, grpEditInfo:data.updatedChat.grpEditInfo})
                setMessages([...messages, newMessage]);
                setShowLoader(false);
                setShowModal(false);


                // emiting grpEditInfoUpdate event to notify all connected socket about this update
                socketRef.current.emit('grpEditInfoUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage);

            }
            else{
                let formData = new FormData();
                formData.append('grpSendMessages', permissions);
                formData.append('changedBy', formatedName)

                const res = await fetch(`chats/${selectedConversationInfo._id}?type=grpSendMessages`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                const data = await res.json();

                let modifiedChat;
                let updatedChats = chats.filter((cht)=>{

                    if(cht._id===data.updatedChat._id){
                        const { grpSendMessages, lastMessage, lastMessageDate } = data.updatedChat;
    
                        modifiedChat = {...cht, grpSendMessages:grpSendMessages, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                        return false;
                    }else{
                        return true;
                    }
                })
                updatedChats.unshift(modifiedChat);


                const newMessage = {
                    _id: new Date(Date.now()),
                    text: data.updatedChat.lastMessage,
                    messageMedia: '',
                    messageMediaType: 'notification',
                    cloudinaryId: ''
                }

                // reseting values
                setChats(updatedChats);
                setSelectedConversationInfo({...selectedConversationInfo, grpSendMessages:data.updatedChat.grpSendMessages})
                setMessages([...messages, newMessage]);
                setShowLoader(false);
                setShowModal(false);


                // emiting grpSendMessagesUpdate event to notify all connected socket about this update
                socketRef.current.emit('grpSendMessagesUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage);

            }
        }catch(e){
            setShowLoader(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }

    return(
        <>
        <div className='edit-grp-settings-modal-container'>
            <motion.div className='edit-grp-settings-modal' ref={modal}
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
                        <input type='radio' id='all-participants' name='permissions' value='all' onChange={(e)=>setPermissions(e.target.value)} checked={permissions==='all'} /><label htmlFor='all-participants'>All participants</label>
                    </div>
                    <div>
                        <input type='radio' id='only-admins' name='permissions' value='admins' onChange={(e)=>setPermissions(e.target.value)} checked={permissions==='admins'} /><label htmlFor='only-admins'>Only admins</label>
                    </div>
                </form>
                <div className='edit-grp-settings-modal-btns'>
                    <button className='cancel-btn' onClick={()=>setShowModal(false)}>Cancel</button>
                    <button className='confirm-btn' onClick={changePermissions} disabled={showLoader}>
                        {
                            showLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            Confirm
                            </>
                        }
                    </button>
                </div>
            </motion.div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default EditGrpSettingsModal;