import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import { ToastContainer, toast } from 'react-toastify';
import GrpSettings from '../grpSettings/GrpSettings';
import UpdateGrpParticipant from '../updateGrpParticipant/UpdateGrpParticipant';
import searchUser from '../../utils/searchUser';
import { useClickOutside } from '../../utils/useClickOutside';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './updateGrp.css'; 
import 'react-toastify/dist/ReactToastify.css';

const UpdateGrp = ( { setShowUpdateGrp, setShowConversation } )=>{

    // getting values & methods from global state
    const [, , user, , , , socketRef, , , , , , , , setSelectedConversationId, selectedConversationInfo, setSelectedConversationInfo, chats, setChats, messages, setMessages] = useContext(Context);
    
    const { users, grpAvatar, grpSubject, grpDesc, grpAdmins, grpCreator, grpSendMessages, grpEditInfo, createdAt} = selectedConversationInfo;






    // state to show or hide update grp icon loader
    const [showGrpIconLoader, setShowGrpIconLoader] = useState(false);
    // state to show or hide the emoji picker for update group subject
    const [showPicker1, setShowPicker1] = useState(false);
    // state to show or hide the emoji picker for update group description
    const [showPicker2, setShowPicker2] = useState(false);
    // state to show or hide inputBox for updating group subject
    const [showUpdateGrpSubjectInput, setShowUpdateGrpSubjectInput] = useState(false);
    // state to hold the update grp subject input value
    const [updateGrpSubjectVal, setUpdateGrpSubjectVal] = useState(grpSubject);
    // state to show or hide update grp subject loader
    const [showGrpSubjectLoader, setShowGrpSubjectLoader] = useState(false);
    // state to show or hide inputBox for updating group subject
    const [showUpdateGrpDescInput, setShowUpdateGrpDescInput] = useState(false);
    // state to hold the update grp description input value
    const [updateGrpDescVal, setUpdateGrpDescVal] = useState(grpDesc);
    // state to show or hide update grp subject loader
    const [showGrpDescLoader, setShowGrpDescLoader] = useState(false);
    // state to show or hide grp settings component
    const [showGrpSettings, setShowGrpSettings] = useState(false);
    // state to show or hide add participant modal
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [addParticipantSearchVal, setAddParticipantSearchVal] = useState('');
    // state that will contian all the matched users results of add participant modal search query
    const [addParticipantSearchedUsers, setAddParticipantSearchedUsers] = useState([]);
    const [showAddParticipantSearchLoader, setShowAddParticipantSearchLoader] = useState(false);
    const [newParticipantsToAdd, setNewParticipantsToAdd] = useState([]);
    const [showAddNewParticipantLoader, setShowAddNewParticipantLoader] = useState(false);

    const [showExitGroupModal, setShowExitGroupModal] = useState(false);
    const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
    const [showExitGroupLoader, setShowExitGroupLoader] = useState(false);
    const [showDeleteGroupLoader, setShowDeleteGroupLoader] = useState(false);



    const navigate = useNavigate();







    const updateGrpSubjectRef = useRef();
    const updateGrpDescRef = useRef();





    // using cutom hook useClickOutside
    const addParticipantModal = useClickOutside(()=>{
        setShowAddParticipantModal(false);
    }, true);

    // using cutom hook useClickOutside
    const exitGroupModal = useClickOutside(()=>{
        setShowExitGroupModal(false);
    }, true);

    // using cutom hook useClickOutside
    const deleteGroupModal = useClickOutside(()=>{
        setShowDeleteGroupModal(false);
    }, true);








    const showGrpSubjectUpdateBox = ()=>{
        setShowUpdateGrpSubjectInput(true);
        setTimeout(()=>{
            updateGrpSubjectRef.current.focus();
        }, 100)
    }
    const showGrpDescUpdateBox = ()=>{
        setShowUpdateGrpDescInput(true);
        setTimeout(()=>{
            updateGrpDescRef.current.focus();
        }, 100)
    }

    // handler that will be called when user clicks on any emoji from emoji picker of subject
    const onEmojiClick1 = (event, emojiObject) => {
        setUpdateGrpSubjectVal(updateGrpSubjectVal+emojiObject.emoji);
        setShowPicker1(false);
        updateGrpSubjectRef.current.focus();
    };
    // handler that will be called when user clicks on any emoji from emoji picker of description
    const onEmojiClick2 = (event, emojiObject) => {
        setUpdateGrpDescVal(updateGrpDescVal+emojiObject.emoji);
        setShowPicker2(false);
        updateGrpDescRef.current.focus();
    };





    // handler that will set file in state when ever the user clicks on update group icon button
    const onSelectingFile = async (e)=>{
        if(!e.target.files || e.target.files.length===0){
            return;
        }

        setShowGrpIconLoader(true);
        try{
            const formatedName = formatName(user.name);

            let formData = new FormData();
            formData.append('grpAvatar', e.target.files[0]);
            formData.append('changedBy', formatedName);

            const res = await fetch(`chats/${selectedConversationInfo._id}?type=grpIcon`, {
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

            const newMessage = {
                _id: new Date(Date.now()),
                text: data.updatedChat.lastMessage,
                messageMedia: '',
                messageMediaType: 'notification',
                cloudinaryId: ''
            }


            // reseting values
            setChats(updatedChats);
            setSelectedConversationInfo(data.updatedChat)
            setMessages([...messages, newMessage]);
            setTimeout(()=>{
                setShowGrpIconLoader(false);
            }, 2000)


            // emiting grpIconUpdate event to notify all connected socket about this update
            socketRef.current.emit('grpIconUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage);
            
            toast.success('Group Icon updated successfully', {
                position:"top-center",
                autoClose:3000
            });

        }catch(err){
            setShowGrpIconLoader(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(err)
        }
    }





    const updateGrpSubject = async ()=>{

        if(!(updateGrpSubjectVal.trim())){
            alert('Group subject should not be empty');
            return;
        }

        setShowGrpSubjectLoader(true);
        try{
            const formatedName = formatName(user.name);

            let formData = new FormData();
            formData.append('grpSubject', updateGrpSubjectVal.trim());
            formData.append('changedBy', formatedName);

            const res = await fetch(`chats/${selectedConversationInfo._id}?type=grpSubject`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();


            let modifiedChat;
            let updatedChats = chats.filter((cht)=>{

                if(cht._id===data.updatedChat._id){
                    const { grpSubject, lastMessage, lastMessageDate } = data.updatedChat;
                    modifiedChat = {...cht, grpSubject:grpSubject, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
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
            setSelectedConversationInfo({...selectedConversationInfo, grpSubject:data.updatedChat.grpSubject})
            setMessages([...messages, newMessage]);
            setShowUpdateGrpSubjectInput(false);
            setShowGrpSubjectLoader(false);



            // emiting grpSubjectUpdate event to notify all connected socket about this update
            socketRef.current.emit('grpSubjectUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage);

        }catch(e){
            setShowGrpSubjectLoader(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }





    const updateGrpDesc = async ()=>{

        setShowGrpDescLoader(true);
        try{
            const formatedName = formatName(user.name);

            let formData = new FormData();
            formData.append('grpDesc', updateGrpDescVal.trim());
            formData.append('changedBy', formatedName);

            const res = await fetch(`chats/${selectedConversationInfo._id}?type=grpDesc`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();


            let modifiedChat;
            let updatedChats = chats.filter((cht)=>{

                if(cht._id===data.updatedChat._id){
                    const { grpDesc, lastMessage, lastMessageDate } = data.updatedChat;
                    modifiedChat = {...cht, grpDesc:grpDesc, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
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
            setSelectedConversationInfo({...selectedConversationInfo, grpDesc:data.updatedChat.grpDesc})
            setMessages([...messages, newMessage]);
            setShowUpdateGrpDescInput(false);
            setShowGrpDescLoader(false);


            // emiting grpDescUpdate event to notify all connected socket about this update
            socketRef.current.emit('grpDescUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage);

        }catch(e){
            setShowGrpDescLoader(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }






    const handleAddParticipantSearch = (e)=>{
        let val = e.target.value;
        setAddParticipantSearchVal(val);
        // checking if the input value is empty, then return
        if(val.trim()===''){
            setAddParticipantSearchedUsers([]);
            return;
        }

        setShowAddParticipantSearchLoader(true);
        // calling the utility function to search matched user in database
        searchUser(val, setShowAddParticipantSearchLoader, setAddParticipantSearchedUsers);
    }



    const addNewParticipantToGrp = (newParticipant)=>{
        // checking the clicked user is already present in this group or not
        for(let alreadyPresentUser of users){
            if(alreadyPresentUser._id===newParticipant._id){
                toast.error('User is already present in this group', {
                    position:"top-center",
                    autoClose:3000
                });
                return;
            }
        }


        // checking user already selected to add in this group or not
        for(let newParticipantToAdd of newParticipantsToAdd){ 
            if(newParticipantToAdd._id===newParticipant._id){
                toast.error('User already selected to add in this group', {
                    position:"top-center",
                    autoClose:3000
                });
                return;
            }
        }

        setNewParticipantsToAdd([...newParticipantsToAdd, newParticipant]);
    }

                                                
                                                                 
    const removeParticipantFromNewParticipantToAdd = (userId)=>{
        let updatedNewParticipantsToAdd = newParticipantsToAdd.filter((user)=>{
            return user._id!==userId;
        });
        setNewParticipantsToAdd(updatedNewParticipantsToAdd);
    }



    const addNewSelectedParticipantsToGrp = async ()=>{
        setShowAddNewParticipantLoader(true);
        try{
            const newParticipantsToAddIds = newParticipantsToAdd.map((participant)=>{
                return participant._id;
            })

            const formatedName = formatName(user.name);

            let formData = new FormData();
            formData.append('newParticipants', newParticipantsToAddIds);
            formData.append('changedBy', formatedName);

            const res = await fetch(`chats/${selectedConversationInfo._id}?type=addNewParticipants`, {
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
            updatedChats.unshift(data.updatedChat);


            const newMessages = [];
            newParticipantsToAdd.forEach((newPrt, index)=>{

                const formatedPrtName = formatName(newPrt.name)

                const newMessage = {
                    _id: new Date(Date.now() + index),
                    text: `${formatedName} added ${formatedPrtName}`,
                    messageMedia: '',
                    messageMediaType: 'notification',
                    cloudinaryId: ''
                }
                
                newMessages.push(newMessage);
            })
            


            // reseting values
            setChats(updatedChats);
            setSelectedConversationInfo(data.updatedChat);
            setMessages([...messages, ...newMessages]);
            setShowAddNewParticipantLoader(false);
            setAddParticipantSearchedUsers([]);
            setNewParticipantsToAdd([]);
            setAddParticipantSearchVal('');
            setShowAddParticipantModal(false);


            // emiting addNewParticipantsToGrp event to notify all connected socket about this update
            socketRef.current.emit('addNewParticipantToGrp', String(selectedConversationInfo._id), data.updatedChat, newMessages);

        }catch(e){
            setShowAddNewParticipantLoader(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }





    const handleExitGroupConfirmClick = async ()=>{
        setShowExitGroupLoader(true);
        try{

            let formData = new FormData();
            formData.append('exitParticipantId', user._id);
            formData.append('exitParticipantName', user.name);


            const res = await fetch(`chats/${selectedConversationInfo._id}?type=exitGrpParticipant`, {
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
                return updatedGrpAdminId!==user._id
            });
            let updatedGrpUsers = users.filter((updatedGrpUser)=>{
                return updatedGrpUser._id!==user._id
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
            setChats((chts)=>{
                return chts.filter((cht)=>{
                    return cht._id!==data.updatedChat._id;
                })
            });
            setShowExitGroupLoader(false);
            setShowExitGroupModal(false);
            setShowConversation(null);
            setSelectedConversationId(null);
            setSelectedConversationInfo(null);
            setMessages([]);
            navigate('/messages')


            // emiting removeParticipantUpdate event to notify all connected socket about this update
            socketRef.current.emit('exitParticipantUpdate', String(selectedConversationInfo._id), data.updatedChat, newMessage, updatedSelectedConversationInfo);

        }catch(e){
            setShowExitGroupLoader(false);
            setShowExitGroupModal(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }




    const handleDeleteGroupConfirmClick = async ()=>{
        setShowDeleteGroupLoader(true);
        try{

            const res = await fetch(`chats/${selectedConversationInfo._id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
    
            if(!res.ok){
                throw new Error(res.statusText);
            }
    
            await res.json();


            let updatedChats = chats.filter((cht)=>{
                return cht._id!==selectedConversationInfo._id;
            })

    

            // reseting values
            setChats(updatedChats);
            setShowDeleteGroupLoader(false);
            setShowDeleteGroupModal(false);
            setShowConversation(null);
            setSelectedConversationId(null);
            setSelectedConversationInfo(null);
            setMessages([]);
            navigate('/messages')


            // emiting removeParticipantUpdate event to notify all connected socket about this update
            socketRef.current.emit('deleteGrpUpdate', String(selectedConversationInfo._id), selectedConversationInfo._id);

        }catch(e){
            setShowDeleteGroupLoader(false);
            setShowDeleteGroupModal(false);
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }

    return(
        <>
        <motion.div className='update-grp-container'
            initial={{x:'100%'}}
            animate={{x:0}}
            transition={{type:'tween'}}
        >
            <div className='update-grp-header'>
                <motion.span className='update-grp-cancel' onClick={()=>setShowUpdateGrp(false)} title='Close'
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <path fill="currentColor" d="m19.1 17.2-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.4-5.3-5.3-1.8 1.7 5.3 5.3-5.3 5.3L6.7 19l5.3-5.3 5.3 5.3 1.8-1.8z"></path>
                    </svg>
                </motion.span>
                <h3>Group info</h3>
            </div>

            <div className='update-grp-info-container'>
                <form encType='multipart/form-data'>
                    <div className='update-grp-image-container'>
                        {
                            <>
                            {
                                showGrpIconLoader && <div className='update-grp-image-loader-container'>
                                    <img src='images/spiner2.gif' alt='loader' className='grpIconLoader' />
                                </div>
                            }
                            <img src={grpAvatar ? grpAvatar : '/images/grpPlaceholder.png'} alt='grpIcon' />
                            {
                                grpAdmins.includes(user._id) || grpEditInfo==='all'
                                ?
                                !showGrpIconLoader && <div className='update-grp-image' title='Update icon'>
                                    <i className="fas fa-camera"></i>
                                    <input type='file' accept='image/*' onChange={onSelectingFile} name='grpAvatar'/>
                                </div>
                                :
                                null
                            }
                            </>
                        }
                    </div>
                    {
                        showUpdateGrpSubjectInput
                        ?
                        <div className='update-grp-input-wrapper'>
                            <i className="far fa-grin" title='Open emoji picker' onClick={()=>setShowPicker1(!showPicker1)} style={showPicker1 ? {background:'#d1e1ff'} : null}></i>
                            <input type='text' value={updateGrpSubjectVal} onChange={(e)=>setUpdateGrpSubjectVal(e.target.value)} ref={updateGrpSubjectRef}/>
                            {
                                showGrpSubjectLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <span title='Click to save' onClick={updateGrpSubject}>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m9 17.2-4-4-1.4 1.3L9 19.9 20.4 8.5 19 7.1 9 17.2z"></path></svg>
                                </span>
                            }

                            {
                                showPicker1 && <Picker pickerStyle={{ position: 'absolute', top:'30px', left:'0%', zIndex:10}} onEmojiClick={onEmojiClick1}/>
                            }
                        </div>
                        :
                        <h2 className='update-grp-name'>
                            {grpSubject} 
                            {
                                (grpAdmins.includes(user._id) || grpEditInfo==='all') && <i className="fas fa-pencil-alt" title='Click to edit' onClick={showGrpSubjectUpdateBox}></i>
                            }
                        </h2>
                    }
                    <p className='grp-participants'>Group - {users.length} participants</p>
                </form>


                <div className='grp-desc-and-date' style={showUpdateGrpDescInput ? {padding:'20px'} : null}>
                    {
                        showUpdateGrpDescInput
                        ?
                        <div className='update-grp-input-wrapper' style={{marginTop:'0px'}}>
                            <i className="far fa-grin" title='Open emoji picker' onClick={()=>setShowPicker2(!showPicker2)} style={showPicker2 ? {background:'#d1e1ff'} : null}></i>
                            <input type='text' style={{fontSize:'16px'}} value={updateGrpDescVal} onChange={(e)=>setUpdateGrpDescVal(e.target.value)} ref={updateGrpDescRef}/>
                            {
                                showGrpDescLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <span title='Click to save' onClick={updateGrpDesc}>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m9 17.2-4-4-1.4 1.3L9 19.9 20.4 8.5 19 7.1 9 17.2z"></path></svg>
                                </span>
                            }
                            {
                                showPicker2 && <Picker pickerStyle={{ position: 'absolute', top:'-325px', left:'0%', zIndex:10}} onEmojiClick={onEmojiClick2}/>
                            }
                        </div>
                        :
                        <p className='desc'>
                            {grpDesc} 
                            {
                                (grpAdmins.includes(user._id) || grpEditInfo==='all') && <i className="fas fa-pencil-alt" title='Click to edit' onClick={showGrpDescUpdateBox}></i>
                            }
                        </p>
                    }
                    <p className='date' style={showUpdateGrpDescInput ? {padding:'0px'} : null}>
                        {
                            grpCreator===user._id || grpCreator._id===user._id
                            ?
                            `Group created by you, on ${new Date(createdAt).toLocaleDateString()} at ${new Date(createdAt).toLocaleTimeString()}`
                            :
                            `Group created by ${grpCreator.name}, on ${new Date(createdAt).toLocaleDateString()} at ${new Date(createdAt).toLocaleTimeString()}`
                        }
                    </p>
                </div>

                
                {
                    (grpAdmins.includes(user._id) || grpEditInfo==='all') && <motion.div className='grp-settings-wrapper' onClick={()=>setTimeout(()=>setShowGrpSettings(true), 200)}
                        initial={{background:'#fff'}}
                        whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                    >
                        <i className="fas fa-cog settings-icon"></i>
                        <p>Group Settings</p>
                        <i className="fas fa-chevron-right arrow-icon"></i>
                    </motion.div>
                }


                <div className='grp-participants-wrapper'>
                    <p className='participants-count'>{users.length} participants</p>
                    {
                        (grpAdmins.includes(user._id) || grpEditInfo==='all') && <motion.div className='update-grp-add-participant' onClick={()=>setTimeout(()=> setShowAddParticipantModal(true), 500)}
                            initial={{background:'#fff'}}
                            whileHover={{background:'#f5f6f6'}}
                            whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                        >
                            <div className='update-grp-add-participant-icon'>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14.7 12c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6-3.6 1.6-3.6 3.6 1.6 3.6 3.6 3.6zm-8.1-1.8V7.5H4.8v2.7H2.1V12h2.7v2.7h1.8V12h2.7v-1.8H6.6zm8.1 3.6c-2.4 0-7.2 1.2-7.2 3.6v1.8H22v-1.8c-.1-2.4-4.9-3.6-7.3-3.6z"></path></svg>
                            </div>
                            <p>Add participant</p>
                        </motion.div>
                    }

                    <div className='update-grp-add-participant-modal-container' style={showAddParticipantModal ? null : {display:'none'}}>
                        <motion.div className='update-grp-add-participant-modal' ref={addParticipantModal}
                            initial={{scale:0}}
                            animate={{scale:1}}
                            transition={{delay:0.2}}
                        >
                            <div className='update-grp-add-participant-modal-header'>
                                <motion.span className='update-grp-add-participant-modal-cancel' onClick={()=>setShowAddParticipantModal(false)} title='Close'
                                    initial={{background:'#fff'}}
                                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                                >
                                    <svg viewBox="0 0 24 24" width="28" height="28">
                                        <path fill="currentColor" d="m19.1 17.2-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.4-5.3-5.3-1.8 1.7 5.3 5.3-5.3 5.3L6.7 19l5.3-5.3 5.3 5.3 1.8-1.8z"></path>
                                    </svg>
                                </motion.span>
                                <h3>Add participant</h3>
                            </div>

                            <div className='add-participant-modal-bottom'>
                                <input type='text' placeholder='Search...' value={addParticipantSearchVal} onChange={handleAddParticipantSearch} />

                                <div className='add-participant-modal-search-results' style={addParticipantSearchedUsers.length ? null : {marginTop:0}}>
                                    {
                                        showAddParticipantSearchLoader
                                        ?
                                        <img src='/images/spiner2.gif' alt='loader' className='add-participant-modal-search-results-loader' />
                                        :
                                        addParticipantSearchedUsers.length
                                        ?
                                        addParticipantSearchedUsers.map((searchedParticipant)=>{
                                            return(
                                                <div className='add-participant-modal-search-result' key={searchedParticipant._id} onClick={()=>addNewParticipantToGrp(searchedParticipant)}>
                                                    <img src={searchedParticipant.profileImage} alt='profileImage' />
                                                    <h3>
                                                        {
                                                            formatName(searchedParticipant.name)
                                                        }
                                                    </h3>
                                                </div>
                                            )
                                        })
                                        :
                                        null
                                    }
                                </div>
                                
                                {
                                    Boolean(newParticipantsToAdd.length) && <div className='add-participant-modal-users-list'>
                                        {
                                            newParticipantsToAdd.length
                                            ?
                                            newParticipantsToAdd.map((participantToAdd)=>{
                                                return(
                                                    <div className='add-participant-modal-user' key={participantToAdd._id}>
                                                        <img src={participantToAdd.profileImage} alt='userAvatar' />
                                                        <p>
                                                            {
                                                                formatName(participantToAdd.name)
                                                            }
                                                        </p>
                                                        <span onClick={()=>removeParticipantFromNewParticipantToAdd(participantToAdd._id)}>
                                                            <svg viewBox="0 0 24 24" width="18" height="18">
                                                                <path fill="currentColor" d="m19.1 17.2-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.4-5.3-5.3-1.8 1.7 5.3 5.3-5.3 5.3L6.7 19l5.3-5.3 5.3 5.3 1.8-1.8z"></path>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                )
                                            })
                                            :
                                            null
                                        }
                                    </div>
                                }

                                {
                                Boolean(newParticipantsToAdd.length) && <motion.button className='add-participant-modal-addUsers-btn' onClick={addNewSelectedParticipantsToGrp} disabled={showAddNewParticipantLoader}
                                    initial={{scale:1}}
                                    whileTap={{scale:0.85}}
                                >
                                    {
                                        showAddNewParticipantLoader
                                        ?
                                        <img src='/images/spiner2.gif' alt='loader' />
                                        :
                                        <svg viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="currentColor" d="m8 17.1-5.2-5.2-1.7 1.7 6.9 7L22.9 5.7 21.2 4 8 17.1z"></path>
                                        </svg>
                                    }
                                </motion.button>
                                }
                            </div>
                        </motion.div>
                    </div>


                    <div className='update-grp-participants-list'>
                        {
                            users.map((grpUser)=>{
                                return <UpdateGrpParticipant key={grpUser._id} grpUser={grpUser} grpAdmins={grpAdmins} grpSubject={grpSubject} users={users}/>
                            })
                        }
                        
                    </div>
                </div>


                <motion.div className='update-grp-exit-and-delete' onClick={()=>setTimeout(()=>setShowExitGroupModal(true), 200)}
                    initial={{background:'#fff'}}
                    whileHover={{background:'#f5f6f6'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m16.6 8.1 1.2-1.2 5.1 5.1-5.1 5.1-1.2-1.2 3-3H8.7v-1.8h10.9l-3-3zM3.8 19.9h9.1c1 0 1.8-.8 1.8-1.8v-1.4h-1.8v1.4H3.8V5.8h9.1v1.4h1.8V5.8c0-1-.8-1.8-1.8-1.8H3.8C2.8 4 2 4.8 2 5.8v12.4c0 .9.8 1.7 1.8 1.7z"></path></svg>
                    <p>Exit group</p>
                </motion.div>
                {
                    (grpAdmins.includes(user._id) || grpEditInfo==='all') && <motion.div className='update-grp-exit-and-delete' onClick={()=>setTimeout(()=>setShowDeleteGroupModal(true), 200)}
                        initial={{background:'#fff'}}
                        whileHover={{background:'#f5f6f6'}}
                        whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                    >
                        <i className="fas fa-trash" style={{marginLeft:3}}></i>
                        <p style={{marginLeft:20}}>Delete group</p>
                    </motion.div>
                }
            </div>


            {
                showGrpSettings && <GrpSettings setShowGrpSettings={setShowGrpSettings} grpSendMessages={grpSendMessages} grpEditInfo={grpEditInfo}/>
            }

            showExitGroupModal && <div className='exit-group-modal-container' style={showExitGroupModal ? null : {display:'none'}}>
                <div className='exit-group-modal' ref={exitGroupModal}>
                    <p>Exit "{grpSubject}" group?</p>
                    <div className='exit-group-modal-btns'>
                        <button className='cancel-btn' onClick={()=>setShowExitGroupModal(false)}>Cancel</button>
                        <button className='confirm-btn' onClick={handleExitGroupConfirmClick} disabled={showExitGroupLoader}>
                            {
                                showExitGroupLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <>
                                Confirm
                                </>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <div className='delete-group-modal-container' style={showDeleteGroupModal ? null : {display:'none'}}>
                <div className='delete-group-modal' ref={deleteGroupModal}>
                    <p>Delete "{grpSubject}" group?</p>
                    <div className='delete-group-modal-btns'>
                        <button className='cancel-btn' onClick={()=>setShowDeleteGroupModal(false)}>Cancel</button>
                        <button className='confirm-btn' onClick={handleDeleteGroupConfirmClick} disabled={showDeleteGroupLoader}>
                            {
                                showDeleteGroupLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <>
                                Confirm
                                </>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default UpdateGrp;