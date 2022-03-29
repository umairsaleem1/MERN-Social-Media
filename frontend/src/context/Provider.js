import React, { useState, useRef } from 'react';
import Context from './Context';

const Provider = ( { children } )=>{

    // state that will contain all posts to show on home page
    const [posts, setPosts] = useState([]);

    // state that will contain posts to show on profile page
    const [profilePosts, setProfilePosts] = useState([]);

    const [newPostsAvailable, setNewPostsAvailable] = useState(false);

    // state that will contain currently logged in user data fetched from backend
    const [user, setUser] = useState(undefined);


    // state that will contain id of of the Conversation with which the user is currently chatting(by clicking on the Conversation Overview)
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    // state that will contain info of the user/group present in header of conversation to whom the user is currently chatting(by clicking on the Conversation Overview)
    const [selectedConversationInfo, setSelectedConversationInfo] = useState('');
    // state that will contain the user's chat history
    const [chats, setChats] = useState([]);
    // state that will contain the conversation messages of selectedConverstionId
    const [messages, setMessages] = useState([]);  

    
    // state that will contain a boolean to show either any user is typing or not to send message to anyone
    const [isTyping, setIsTyping] = useState([]);
    // state that will contain the conversationIds to whom the user is typing a message
    const [typingChatIds, setTypingChatIds] = useState({});

    const [isRecording, setIsRecording] = useState([]);
    const [recordingChatIds, setRecordingChatIds] = useState({});


    const [onlineUsers, setOnlineUsers] = useState([]);

    const [chatHistoryFetched, setChatHistoryFetched] = useState(false);


    const [notifications, setNotifications] = useState([]);
    const [moreNotificationsToSkip, setMoreNotificationsToSkip] = useState(0);
    const [messagesNotifications, setMessagesNotifications] = useState([]);


    

    const [unreadNotificationsPresent, setUnreadNotificationsPresent] = useState(false);
    const [unreadMessagesPresent, setUnreadMessagesPresent] = useState(false);






    // It will hold the socket Instance(user) reference connected to backend
    const socketRef = useRef(null);



    

    return(
        <Context.Provider value={[posts, setPosts, user, setUser, profilePosts, setProfilePosts, socketRef, onlineUsers, setOnlineUsers, isTyping, setIsTyping, typingChatIds, setTypingChatIds, selectedConversationId, setSelectedConversationId, selectedConversationInfo, setSelectedConversationInfo, chats, setChats, messages, setMessages, isRecording, setIsRecording, recordingChatIds, setRecordingChatIds, chatHistoryFetched, setChatHistoryFetched, notifications, setNotifications, moreNotificationsToSkip, setMoreNotificationsToSkip, unreadNotificationsPresent, setUnreadNotificationsPresent, unreadMessagesPresent, setUnreadMessagesPresent, messagesNotifications, setMessagesNotifications, newPostsAvailable, setNewPostsAvailable]}>
            {children}
        </Context.Provider>
    );
}

export default Provider;