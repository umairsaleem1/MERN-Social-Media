import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Picker from 'emoji-picker-react';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../../components/navbar/Navbar';
import ConversationOverview from '../../components/conversationOverview/ConversationOverview';
import ConversationHeader from '../../components/conversationHeader/ConversationHeader';
import ConversationMessages from '../../components/conversationMessages/ConversationMessages';
import UpdateGrp from '../../components/updateGrp/UpdateGrp';
import { NotificationSkeleton } from '../../components/skeletons/Skeletons';
import searchUser from '../../utils/searchUser';
import authenticateUser from '../../utils/authenticateUser';
import checkNotificationsUpdate from '../../utils/checkNotificationsUpdate';
import { useSocket } from '../../utils/useSocket';
import { useJoinChats } from '../../utils/useJoinChats';
import useWindowDimensions from '../../utils/useWindowDimensions';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './messages.css'; 
import 'react-toastify/dist/ReactToastify.css';

const Messages = ()=>{
 
    // getting values & methods from global state
    const [, , user, setUser, , , , , , , , , , , setSelectedConversationId, , setSelectedConversationInfo, chats, setChats, , , , , , , chatHistoryFetched, , , , , , , setUnreadNotificationsPresent, , setUnreadMessagesPresent, , setMessagesNotifications] = useContext(Context);


    const [showUpdateGrp, setShowUpdateGrp] = useState(false);
    // state to show ConversationMessages with user/group or show default chatting screen
    const [showConversation, setShowConversation] = useState(false);




    // calling custom hook for all the socket related stuff
    useSocket(setShowConversation);
    // calling custom hook to fetch and then join all chats of currently logged in user
    useJoinChats(); 


    // using custom hook to get width of window
    const { width } = useWindowDimensions();





    useEffect(()=>{
        document.title = 'Messages';
    }, [])

    // making call to backend to check if any new notifications present which the user has not opened yet or not(to show update indicator on top if the use has not opened the new notifications yet)
    useEffect(()=>{
        if(user){
            checkNotificationsUpdate(user._id, setUnreadNotificationsPresent);
        }
    }, [user, setUnreadNotificationsPresent])







    useEffect(()=>{
        // function to mark the lastest(newest)(single) messages notification of this user as opened(true)
        const updateLatestNotification = async ()=>{
            try{
                const res = await fetch(`/notifications?type=${"message"}`, {
                    method: 'PUT',
                    credentials: 'include'
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                await res.json();

                setUnreadMessagesPresent(false);

            }catch(e){
                console.log(e);
            }
        }

        updateLatestNotification();
        
    }, [setUnreadMessagesPresent])







    useEffect(()=>{
        // making request to backend to fetch notifications
        const fetchMessagesNotifications = async ()=>{
            try{
                let res = await fetch(`/notifications?type=${"message"}`, {
                        credentials: 'include'
                }); 
        
                if(!res.ok){
                    throw new Error(res.statusText);
                }
        
                const data = await res.json();
                setMessagesNotifications(data.notifications);                        
        
            }catch(e){
                toast.error('Oops! some problem occurred in fetching latest messages', {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(e);
            }
        }
        
        fetchMessagesNotifications();
        

    }, [setMessagesNotifications])




    








    
    //############ States from create new group component ####################

    const [showCreateGrp, setShowCreateGrp] = useState(false);
    // state to show or hide the emoji picker for group subject
    const [showPicker1, setShowPicker1] = useState(false);
    // state to show or hide the emoji picker for group description
    const [showPicker2, setShowPicker2] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState();
    const [grpInfo, setGrpInfo] = useState({subject:'', desc:'',});
    // state that will contain value of searchInput in createNewGroup component
    const [searchGrpUserVal, setSearchGrpUserVal] = useState('');
    // state that will contain all matched users(if any) after searching in createNewGroup component
    const [searchedGrpUsers, setSearchedGrpUsers] = useState([]);
    // state to show or hide searchUsertoAddInGroup loader
    const [showGrpSearchLoader, setShowGrpSearchLoader] = useState(false);
    // state that will contain users selected to add in new group
    const [addedGrpUsers, setAddedGrpUsers] = useState([]);
    const [showCreateGrpLoader, setShowCreateGrpLoader] = useState(false)



    // ################## UseEffects createNewGroup component ################

    // create a preview(set url of selected file) , whenever selected file is changed
    useEffect(()=>{
        if(!selectedFile){
            setPreview(undefined);
            return;
        }

        // generating the url of the selected file
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return ()=>{
            URL.revokeObjectURL(objectUrl);
        }

    }, [selectedFile, setPreview])



    // References of subject & desc input fields of createNewGroup component
    const subjectInputRef = useRef();
    const descInputRef = useRef();












    // ################## States for search user for chat component ################

    const [showChatSearch, setShowChatSearch] = useState(false);
    // state that will contain value of searchInput in searchUserForChat component
    const [searchedChatUserVal, setSearchedChatUserVal] = useState('');
    // state that will contain all matched users(if any) after searching in createNewGroup component
    const [searchedChatUsers, setSearchedChatUsers] = useState([]);
    const [showChatSearchLoader, setShowChatSearchLoader] = useState(false);



    // ################## UseEffects for search user for chat component ################

    // useEffect to focus the search chat user input when search user for chat component renders
    useEffect(()=>{
        if(showChatSearch){
            searchChatUserInputRef.current.focus();
        }
    }, [showChatSearch])



    // References of search input field of search user for chat component
    const searchChatUserInputRef = useRef();











    const navigate = useNavigate();

    useEffect(()=>{
        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);

    }, [navigate, setUser])





    








    





    // ##################### Functions for createNewGroup component ###############

     // handler that will set file in state when ever the user clicks on select group icon button
     const onSelectingFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedFile(undefined);
            return;
        }
        setSelectedFile(e.target.files[0]);
    }


    // handler that will be called when subject & desc input field value changes of new group
    const handleGrpInputValueChange = (e)=>{
        setGrpInfo({...grpInfo, [e.target.name]:e.target.value});
    }



    // handler that will be called when user clicks on any emoji from emoji picker of subject
    const onEmojiClick1 = (event, emojiObject) => {
        setGrpInfo({...grpInfo, subject:grpInfo.subject+emojiObject.emoji});
        setShowPicker1(false);
        subjectInputRef.current.focus();
    };
    // handler that will be called when user clicks on any emoji from emoji picker of description
    const onEmojiClick2 = (event, emojiObject) => {
        setGrpInfo({...grpInfo, desc:grpInfo.desc+emojiObject.emoji});
        setShowPicker2(false);
        descInputRef.current.focus();
    };




    // handler that will be called when add user input value changes
    const handleAddGrpUserSearch = (e)=>{
        let val = e.target.value;
        setSearchGrpUserVal(val);
        // checking if the input value is empty, then return
        if(val.trim()===''){
            setSearchedGrpUsers([]);
            return;
        }

        setShowGrpSearchLoader(true);
        // calling the utility function to search matched user in database
        searchUser(val, setShowGrpSearchLoader, setSearchedGrpUsers);
    }

    // handler that will add user to grp when clicked on any group search result user
    const addUserToGrp = (newUser)=>{
        // checking the clicked user is same who created the group if yes then return
        if(newUser._id===user._id){
            toast.error('You are already in this group', {
                position:"top-center",
                autoClose:3000
            });
            return;
        }
        // checking user already present in grp or not
        for(let u of addedGrpUsers){ 
            if(u._id===newUser._id){
                toast.error('User already added', {
                    position:"top-center",
                    autoClose:3000
                });
                return;
            }
        }
        setAddedGrpUsers([...addedGrpUsers, newUser]);
    }

    // handler that will remove user from grp when clicked on cross icon of any added group users
    const removeUserFromGrp = (userId)=>{
        let updatedAddedGrpUsers = addedGrpUsers.filter((user)=>{
            return user._id!==userId;
        });
        setAddedGrpUsers(updatedAddedGrpUsers);
    }


    const handleCreateGrpSubmit = async (event)=>{
        event.preventDefault();

        if(!grpInfo.subject.trim()){
            toast.error('Please enter group subject', {
                position:"top-center",
                autoClose:3000
            });
            return;
        }

        setShowCreateGrpLoader(true);
        try{
            let users = addedGrpUsers.map((user)=>{
                return user._id;
            })

            let formData = new FormData();
            formData.append('isGrp', true);
            formData.append('grpAvatar', selectedFile);
            formData.append('grpSubject', grpInfo.subject.trim());
            formData.append('grpDesc', grpInfo.desc.trim());
            formData.append('users', users);
            formData.append('grpCreatorName', user.name);
            
            
            const res = await fetch('/chats', {
                method:'POST',
                credentials:'include',
                body:formData
            })

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // adding new chat to chat history
            setChats([data.savedChat, ...chats]);



            // reseting values
            setShowCreateGrp(false);
            setSelectedFile('');
            setPreview('');
            setGrpInfo({subject:'', desc:''});
            setSearchGrpUserVal('');
            setSearchedGrpUsers([]);
            setAddedGrpUsers([]);
            setShowCreateGrpLoader(false);
            setSelectedConversationInfo(data.savedChat);
            setSelectedConversationId(data.savedChat._id);
            setShowConversation(true);

        }catch(e){
            setShowCreateGrpLoader(false);
            console.log(e);
        }
    }









    // ##################### Functions for search user for chat component ###############

    // handler that will be called when search user input for chat input value changes
    const handleChatUserSearch = (e)=>{
        let val = e.target.value;
        setSearchedChatUserVal(val);
        // checking if the input value is empty, then return
        if(val.trim()===''){
            setSearchedChatUsers([]);
            return;
        }

        setShowChatSearchLoader(true);
        // calling the utility function to search matched user in database
        searchUser(val, setShowChatSearchLoader, setSearchedChatUsers);
    }


    // handler that will be called when clicked on any user result in search user component
    const handleChatSearchUserClick = async (person)=>{
        if(person._id===user._id){
            toast.error('You cannot chat with yourself', {
                position:"top-center",
                autoClose:3000
            });
            return;
        }


        // if user's chat history is not empty(means user has chatted with at least one person)
        if(chats.length){
            let isAlreadyChatted = false;
            let alreadyChat;

            for(let chat of chats){
                if(chat.users[0]._id===person._id || chat.users[1]._id===person._id){
                    isAlreadyChatted = true;
                    alreadyChat = chat;
                    break;
                }
            }

            // checking if clicked user is already included in chat history then do nothing and open that chat for conversation
            if(isAlreadyChatted){
                // reseting values
                setShowChatSearch(false);
                setSearchedChatUserVal('');
                setSelectedConversationInfo(alreadyChat);
                setSelectedConversationId(alreadyChat._id);
                setShowConversation(true);

                return;
            }
        }

        try{
            // creating new chat to add in user's chat history
            let newChat = {
                user: person._id,
                isGrp: false
            }
            
            // making request to backend to create a new chat
            const res = await fetch('/chats', {
                method: 'POST',
                credentials: 'include',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newChat)
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // adding new chat to chat history
            setChats([data.savedChat, ...chats]);



            // reseting values
            setShowChatSearch(false);
            setSearchedChatUserVal('');
            setSelectedConversationInfo(data.savedChat);
            setSelectedConversationId(data.savedChat._id);
            setShowConversation(true);

        }catch(e){
            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }

    return(
        user
        ?
        <>
            <Navbar/>
            <div className='messages-page'>
                <div className='all-conversations-container' style={width<=670 ? !showConversation ? {width:'100%'} : {width:'0%'} : null}>
                    <div className='all-conversations-header'>
                        <Link to='/profile'>
                            <img src={user.profileImage} alt='profileImage' />
                        </Link>
                        <div className='search-and-grp-btns'>
                            <motion.i className="fas fa-search chat-search-btn" onClick={()=>setShowChatSearch(true)}
                                initial={{background:'#fff'}}
                                whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                            ></motion.i>
                            <motion.span className='create-group-btn' onClick={()=>setShowCreateGrp(true)}
                                initial={{background:'#fff'}}
                                whileTap={{background:'rgba(53, 53, 53, 0.05)'}} 
                            >
                                <i className="fas fa-users"></i><i className="fas fa-plus" style={{fontSize:'0.7rem'}}></i>
                            </motion.span>
                        </div>
                    </div>

                    <div className='all-conversations'>
                        {
                            chats.length && chats[0]
                            ?
                            chats.map((chat)=>{
                                return(
                                    <ConversationOverview key={chat._id} showConversation={showConversation} setShowConversation={setShowConversation} chat={chat} setShowUpdateGrp={setShowUpdateGrp} />
                                )
                            }) 
                            :
                                !chatHistoryFetched
                                ?
                                <>
                                    <NotificationSkeleton/>
                                    <NotificationSkeleton/>
                                    <NotificationSkeleton/>
                                    <NotificationSkeleton/>
                                </>
                                :
                                null
                        }
                    </div>

                    {
                        showChatSearch && <motion.div className='chat-search'
                            initial={{x:'-100%'}}
                            animate={{x:0}}
                            transition={{type:'tween'}}
                        >
                            <div className='chat-search-input'>
                                <motion.div className='chat-search-back' onClick={()=>setShowChatSearch(false)}
                                    initial={{background:'#fff'}}
                                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </motion.div>
                                <input type='text' placeholder='Search User to chat' value={searchedChatUserVal} onChange={handleChatUserSearch} ref={searchChatUserInputRef} />
                            </div>

                            {
                                searchedChatUserVal && <div className='chat-search-results'>
                                    {
                                        showChatSearchLoader
                                        ?
                                        <img src='/images/spiner2.gif' alt='loader' className='chat-results-loader' />
                                        :
                                        searchedChatUsers.length
                                        ?
                                        searchedChatUsers.map((searchedChatUser)=>{
                                            return(
                                                <div className='chat-search-result' key={searchedChatUser._id} onClick={()=>handleChatSearchUserClick(searchedChatUser)}>
                                                    <img src={searchedChatUser.profileImage} alt='userAvatar' />
                                                    <h3>
                                                        {
                                                            formatName(searchedChatUser.name)
                                                        }
                                                    </h3>
                                                </div>
                                            )
                                        })
                                        :
                                        null
                                    }
                                </div>
                            }
                        </motion.div>
                    }

                    {
                        showCreateGrp && <motion.div className='create-grp'
                            initial={{x:'-100%'}}
                            animate={{x:0}}
                            transition={{type:'tween'}}
                        >
                            <div className='create-grp-heading'>
                                <motion.div className='create-grp-back' onClick={()=>setShowCreateGrp(false)}
                                    initial={{background:'#fff'}}
                                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </motion.div>
                                <h3>New Group</h3>
                            </div>

                            <div className='create-grp-form-wrapper'>
                                <form onSubmit={handleCreateGrpSubmit} encType='multipart/form-data'>
                                    <div className='choose-grp-icon'>
                                        {
                                            selectedFile
                                            ?
                                            <img src={preview} alt='groupIcon' />
                                            :
                                            <i className="fas fa-camera"></i>
                                        }
                                        <input type='file' className='choose-grp-icon-input' accept='image/*' onChange={onSelectingFile} name='grpAvatar' />
                                    </div>
                                    <p className='choose-grp-icon-text'>Choose group icon</p>

                                    <div className='create-grp-input-wrapper'>
                                        <i className="far fa-grin" onClick={()=>setShowPicker1(!showPicker1)} style={showPicker1 ? {background:'#d1e1ff'} : null}></i>
                                        <input type='text' placeholder='Type group subject here...' name='subject' value={grpInfo.subject} onChange={handleGrpInputValueChange} ref={subjectInputRef} required />
                                        {
                                            showPicker1 && <Picker pickerStyle={width<=900 && width>670 ? {position: 'absolute', top:'-170px', left:'-5%', zIndex:10} : { position: 'absolute', top:'-170px', left:'11%', zIndex:10}} onEmojiClick={onEmojiClick1}/>
                                        }
                                    </div>

                                    <div className='create-grp-input-wrapper'>
                                        <i className="far fa-grin" onClick={()=>setShowPicker2(!showPicker2)} style={showPicker2 ? {background:'#d1e1ff'} : null}></i>
                                        <input type='text' placeholder='Type group description here...' name='desc' value={grpInfo.desc} onChange={handleGrpInputValueChange} ref={descInputRef} />
                                        {
                                            showPicker2 && <Picker pickerStyle={ width<=900 && width>670 ? {position: 'absolute', top:'-170px', left:'-5%', zIndex:10} : { position: 'absolute', top:'-225px', left:'11%', zIndex:10}} onEmojiClick={onEmojiClick2}/>
                                        }
                                    </div>

                                    <div className='create-grp-input-wrapper'>
                                        <i className="fas fa-user" style={{top:'-2px'}}></i>
                                        <input type='text' placeholder='Add Users eg: Qasim, Faheem...' value={searchGrpUserVal} onChange={handleAddGrpUserSearch} />
                                    </div>

                                    {
                                        searchGrpUserVal && <div className='grp-search-user-results'>
                                            {
                                                showGrpSearchLoader
                                                ?
                                                <img src='/images/spiner2.gif' alt='loader' className='grp-results-loader' />
                                                :
                                                searchedGrpUsers.length
                                                ?
                                                searchedGrpUsers.map((searchedGrpUser)=>{
                                                    return(
                                                        <div className='grp-search-user-result' key={searchedGrpUser._id} onClick={()=>addUserToGrp(searchedGrpUser)}>
                                                            <img src={searchedGrpUser.profileImage} alt='userAvatar' />
                                                            <h3>
                                                                {
                                                                    formatName(searchedGrpUser.name)
                                                                }
                                                            </h3>
                                                        </div>
                                                    )
                                                })
                                                :
                                                null
                                            }    
                                        </div>
                                    }

                                    {
                                        addedGrpUsers.length
                                        ?
                                        <div className='grp-users-list' style={searchedGrpUsers.length || showGrpSearchLoader ? null : {marginTop:'0px'}}>
                                            {
                                                addedGrpUsers.length
                                                ?
                                                addedGrpUsers.map((addedGrpUser)=>{
                                                    return(
                                                        <div className='grp-user' key={addedGrpUser._id}>
                                                            <img src={addedGrpUser.profileImage} alt='userAvatar' />
                                                            <p>
                                                                {
                                                                    formatName(addedGrpUser.name)
                                                                }
                                                            </p>
                                                            <span onClick={()=>removeUserFromGrp(addedGrpUser._id)}>
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
                                        :
                                        null
                                    }

                                    <motion.button type='submit' className='create-grp-btn' disabled={showCreateGrpLoader}
                                        initial={{scale:1}}
                                        whileTap={{scale:0.85}}
                                    >
                                        {
                                            showCreateGrpLoader
                                            ?
                                            <img src='/images/spiner2.gif' alt='loader' />
                                            :
                                            <>
                                            Create Group
                                            </>
                                        }
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    }
                </div>
                {
                    showConversation
                    ?
                    <div className='conversation-container'>
                        {
                            showUpdateGrp && <UpdateGrp setShowUpdateGrp={setShowUpdateGrp} setShowConversation={setShowConversation}/>   
                        }
                        <ConversationHeader setShowUpdateGrp={setShowUpdateGrp} setShowConversation={setShowConversation} />
                        <ConversationMessages/>
                    </div>
                    :
                    <div className='not-chatting-wrapper'>
                        <div className='not-chatting'>
                            <img src='/images/noChatting.png' alt='noChatting' />
                            <h2>Click on any chat or search a user to start conversation</h2>
                        </div>
                    </div>
                }
            </div>
            <ToastContainer theme='colored'/>
        </>
        :
        <img src='/images/spiner2.gif' alt='loader' className='messages-page-loader' />
    );
}

export default Messages;