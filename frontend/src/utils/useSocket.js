import { useEffect, useContext, useRef } from 'react';
import io from "socket.io-client";
import { useLocation } from 'react-router-dom';
import useSound from 'use-sound';
import Context from '../context/Context';
import updateChatOverview from '../utils/updateChatOverview';
import sendSound from '../sounds/send.mp3';

export const useSocket = (setShowConversation)=>{
    // getting values & methods from global state
    const [, setPosts, user, , , setProfilePosts, socketRef, , setOnlineUsers, , setIsTyping, , setTypingChatIds, , setSelectedConversationId, , setSelectedConversationInfo, , setChats, , setMessages, , setIsRecording, , setRecordingChatIds, , , , setNotifications, , setMoreNotificationsToSkip, , setUnreadNotificationsPresent, , setUnreadMessagesPresent, , setMessagesNotifications, , setNewPostsAvailable] = useContext(Context);


    const location = useLocation();


    const [playSendSound] = useSound(sendSound);




    let timerId = useRef(null);
    // connecting socket instance(user) to backend & registering events if the socket(user) is not already connected
    useEffect(()=>{
        if(user){
            if(!socketRef.current){
                socketRef.current = io('http://localhost:8000');


                socketRef.current.on('connect', ()=>{
                    // firing newConnection event when socket(user) is successfylly connected to server along with user's id as data
                    socketRef.current.emit('newConnection', user._id);
                });

                socketRef.current.on('onlineUsers', (users)=>{
                    setOnlineUsers(users);
                })

                
                // listening to receive new message
                socketRef.current.on('receive-message', (message, room, recordedTime, notification)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });
                        
                    // calling updateChatOverview utility function to show recent message on ConversationOverview of every connected socket(except the sender)
                    updateChatOverview(setChats, room, message, recordedTime);
                    console.log('message received');
                    
                    // if selectedConversationId is same as of which chat's new Message is received
                    if(location.pathname===`/messages` && id===room){
                        setMessages((messages)=>{
                            return [...messages, message]
                        }) 
                        playSendSound();

                        const updateMessagesNotification = async ()=>{
                            try{
                                const res = await fetch(`/notifications/${id}?&type=${"message"}`, {
                                    method: 'PUT',
                                    credentials: 'include'
                                })
                
                                if(!res.ok){
                                    throw new Error(res.statusText)
                                }
                
                                await res.json();
                
                            }catch(e){
                                console.log(e);
                            }
                        }
                        updateMessagesNotification();

                    }else{
                        // alert('New message received');
                        if(location.pathname!=='/messages'){
                            setUnreadMessagesPresent(true);
                        }
                        
                        setMessagesNotifications((prevMessagesNotifications)=>{
                            return [notification, ...prevMessagesNotifications]
                        })
                        playSendSound();
                    }

                });


                // listening for user typing event
                socketRef.current.on('typing', (room, name)=>{
                    setIsTyping((prevIsTyping)=>{
                        return [...prevIsTyping, room];
                    });
                    let prevIds;
                    setTypingChatIds((prevTypingChatIds)=>{
                        prevIds = prevTypingChatIds;
                        return {...prevTypingChatIds, [room]:name}
                    })


                    // if there is already a timer set for settting setIsTyping to false after 1 second the user stops typing, then clear it first
                    if(timerId.current && Object.keys(prevIds).includes(room)){
                        clearTimeout(timerId.current);
                    }

                    // clearing timer to set setIsTyping state to false 1 second after the user stops typing
                    timerId.current = setTimeout(()=>{
                        setIsTyping((prevIsTyping)=>{
                            return prevIsTyping.filter((prev)=>{
                                return prev!==room;
                            })
                        });
                        setTypingChatIds((prevTypingChatIds)=>{
                            let newTypingChatIds = prevTypingChatIds;
                            delete newTypingChatIds[room];
                            return newTypingChatIds;
                        })
                    }, 1000)
                });


                // listening for user start audio recording event
                socketRef.current.on('startRecording', (room, name)=>{
                    setIsRecording((prevIsRecording)=>{
                        return [...prevIsRecording, room];
                    });
                    setRecordingChatIds((prevRecordingChatIds)=>{
                        return {...prevRecordingChatIds, [room]:name}
                    })
                });

                // listening for user stop audio recording event
                socketRef.current.on('stopRecording', (room)=>{
                    setIsRecording((prevIsRecording)=>{
                        return prevIsRecording.filter((prev)=>{
                            return prev!==room;
                        })
                    });
                    setRecordingChatIds((prevRecordingChatIds)=>{
                        let newRecordingChatIds = prevRecordingChatIds;
                        delete newRecordingChatIds[room];
                        return newRecordingChatIds;
                    })
                });

                // listening grpIconUpdate event to get notified about grp icon update
                socketRef.current.on('grpIconUpdate', (room, updatedChat, newMessage)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{
                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id;
                        })
                        updatedChats.unshift(updatedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return updatedChat;
                        }else{
                            return prevInfo;
                        }
                    });

                })


                socketRef.current.on('grpSubjectUpdate', (room, updatedChat, newMessage)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let modifiedChat;
                        let updatedChats = prevChats.filter((cht)=>{
                            if(cht._id===updatedChat._id){
                                const { grpSubject, lastMessage, lastMessageDate } = updatedChat;
                                modifiedChat = {...cht, grpSubject:grpSubject, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                                return false;
                            }else{
                                return true;
                            }
                        })
                        updatedChats.unshift(modifiedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return {...prevInfo, grpSubject: updatedChat.grpSubject};
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('grpDescUpdate', (room, updatedChat, newMessage)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let modifiedChat;
                        let updatedChats = prevChats.filter((cht)=>{
                            if(cht._id===updatedChat._id){
                                const { grpDesc, lastMessage, lastMessageDate } = updatedChat;
                                modifiedChat = {...cht, grpDesc:grpDesc, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                                return false;
                            }else{
                                return true;
                            }
                        })
                        updatedChats.unshift(modifiedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return {...prevInfo, grpDesc: updatedChat.grpDesc};
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('grpEditInfoUpdate', (room, updatedChat, newMessage)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let modifiedChat;
                        let updatedChats = prevChats.filter((cht)=>{
                            if(cht._id===updatedChat._id){
                                const { grpEditInfo, lastMessage, lastMessageDate } = updatedChat;
                                modifiedChat = {...cht, grpEditInfo:grpEditInfo, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                                return false;
                            }else{
                                return true;
                            }
                        })
                        updatedChats.unshift(modifiedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return {...prevInfo, grpEditInfo: updatedChat.grpEditInfo};
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('grpSendMessagesUpdate', (room, updatedChat, newMessage)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let modifiedChat;
                        let updatedChats = prevChats.filter((cht)=>{
                            if(cht._id===updatedChat._id){
                                const { grpSendMessages, lastMessage, lastMessageDate } = updatedChat;
                                modifiedChat = {...cht, grpSendMessages:grpSendMessages, lastMessage:lastMessage, lastMessageDate:lastMessageDate};
                                return false;
                            }else{
                                return true;
                            }
                        })
                        updatedChats.unshift(modifiedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return {...prevInfo, grpSendMessages: updatedChat.grpSendMessages};
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('addNewParticipantsToGrp', (room, updatedChat, newMessages)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, ...newMessages]
                        })
                    }


                    setChats((prevChats)=>{

                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id
                        })
                        updatedChats.unshift(updatedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return updatedChat;
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('grpAddAdminsUpdate', (room, updatedChat, newMessage, updatedSelectedConversationInfo)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id
                        })
                        updatedChats.unshift(updatedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return updatedSelectedConversationInfo;
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('grpDismissAdminsUpdate', (room, updatedChat, newMessage, updatedSelectedConversationInfo)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id
                        })
                        updatedChats.unshift(updatedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return updatedSelectedConversationInfo;
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('removeParticipantUpdate', (room, updatedChat, newMessage, updatedSelectedConversationInfo, userId)=>{
                    if(userId===user._id){
                        setShowConversation(false);
                    }

                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        if(userId===user._id){
                            setMessages([]);
                        }else{
                            setMessages((prevMessages)=>{
                                return [...prevMessages, newMessage]
                            })
                        }
                    }


                    setChats((prevChats)=>{

                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id
                        })
                        
                        if(userId===user._id){
                            return updatedChats;
                        }else{
                            updatedChats.unshift(updatedChat);
                            return updatedChats;
                        }
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(userId===user._id){
                            return null;
                        }else{
                            if(id===room){
                                return updatedSelectedConversationInfo;
                            }else{
                                return prevInfo;
                            }
                        }
                    });

                    setSelectedConversationId((prevId)=>{
                        if(userId===user._id){
                            return null;
                        }else{
                            return prevId;
                        }
                    });
                })


                socketRef.current.on('exitParticipantUpdate', (room, updatedChat, newMessage, updatedSelectedConversationInfo)=>{
                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages((prevMessages)=>{
                            return [...prevMessages, newMessage]
                        })
                    }


                    setChats((prevChats)=>{

                        let updatedChats = prevChats.filter((cht)=>{
                            return cht._id!==updatedChat._id
                        })
                        updatedChats.unshift(updatedChat);

                        return updatedChats;
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return updatedSelectedConversationInfo;
                        }else{
                            return prevInfo;
                        }
                    });
                })


                socketRef.current.on('deleteGrpUpdate', (room, chatId)=>{
                    setShowConversation(false);

                    // selectedConversationId
                    let id;
                    setSelectedConversationId((prevId)=>{
                        id = prevId;
                        return prevId;
                    });

                    // if selectedConversationId is same as of which chat's new Message is received
                    if(id===room){
                        setMessages([]);
                    }


                    setChats((prevChats)=>{
                        return prevChats.filter((cht)=>{
                            return cht._id!==chatId
                        })
                    });

                    setSelectedConversationInfo((prevInfo)=>{
                        if(id===room){
                            return null;
                        }else{
                            return prevInfo;
                        }
                    });

                    setSelectedConversationId((prevId)=>{
                        if(id===room){
                            return null;
                        }else{
                            return prevId;
                        }
                    });
                }) 


                socketRef.current.on('commentNotification', (notification)=>{
                    if(location.pathname!=='/notifications'){
                        setUnreadNotificationsPresent(true);
                    }

                    setNotifications((prevNotifications)=>{
                        return [notification, ...prevNotifications];
                    })
                    setMoreNotificationsToSkip((prevNotToSkip)=>{
                        return prevNotToSkip+1;
                    })


                    playSendSound();
                })


                socketRef.current.on('likeNotification', (notification)=>{
                    if(location.pathname!=='/notifications'){
                        setUnreadNotificationsPresent(true);
                    }

                    setNotifications((prevNotifications)=>{
                        return [notification, ...prevNotifications];
                    })
                    setMoreNotificationsToSkip((prevNotToSkip)=>{
                        return prevNotToSkip+1;
                    })


                    playSendSound();
                })



                socketRef.current.on('followNotification', (notification)=>{
                    if(location.pathname!=='/notifications'){
                        setUnreadNotificationsPresent(true);
                    }

                    setNotifications((prevNotifications)=>{
                        return [notification, ...prevNotifications];
                    })
                    setMoreNotificationsToSkip((prevNotToSkip)=>{
                        return prevNotToSkip+1;
                    })


                    playSendSound();
                })



                socketRef.current.on('newPostUpdate', ()=>{
                    setNewPostsAvailable(true);
                })



                socketRef.current.on('likePostUpdate', (postId, newLike, isLiked)=>{
                    setPosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(post._id===postId){
                                if(isLiked){
                                    let updatedPost = post;
                                    updatedPost.postLikes.push(newLike);
                                    return updatedPost;
                                }else{
                                    let updatedPost = post;
                                    let updatedLikes = updatedPost.postLikes.filter((postLike)=>{
                                        return postLike._id!==newLike._id;
                                    })
                                    updatedPost.postLikes = updatedLikes;
                                    return updatedPost;
                                }
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;
                    })


                    setProfilePosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(post._id===postId){
                                if(isLiked){
                                    let updatedPost = post;
                                    updatedPost.postLikes.push(newLike);
                                    return updatedPost;
                                }else{
                                    let updatedPost = post;
                                    let updatedLikes = updatedPost.postLikes.filter((postLike)=>{
                                        return postLike._id!==newLike._id;
                                    })
                                    updatedPost.postLikes = updatedLikes;
                                    return updatedPost;
                                }
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;
                    })
                })



                socketRef.current.on('newCommentUpdate', (postId, newComment)=>{
                    setPosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(String(post._id)===String(postId)){
                                let updatedPost = post;
                                updatedPost.postComments.unshift(newComment);
                                return updatedPost;
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;

                    })


                    setProfilePosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(String(post._id)===String(postId)){
                                let updatedPost = post;
                                updatedPost.postComments.unshift(newComment);
                                return updatedPost;
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;
                    })
                })



                socketRef.current.on('likePostCommentUpdate', (postId, commentId, newLike, isLiked)=>{
                    setPosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(String(post._id)===String(postId)){
                                let updatedPost = post;
                                let updatedPostComments = updatedPost.postComments.map((postComment)=>{
                                    if(String(postComment._id)===String(commentId)){
                                        if(isLiked){
                                            let updatedComment = postComment;
                                            updatedComment.commentLikes.push(newLike);
                                            return updatedComment;
                                        }else{
                                            let updatedComment = postComment;
                                            let updatedLikes = updatedComment.commentLikes.filter((commentLike)=>{
                                                return commentLike._id!==newLike._id;
                                            })
                                            updatedComment.commentLikes = updatedLikes;
                                            return updatedComment;
                                        }
                                    }else{
                                        return postComment;
                                    }
                                })
                                updatedPost.postComments = updatedPostComments;
                                return updatedPost;
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;
                    })


                    setProfilePosts((posts)=>{
                        let updatedPosts = posts.map((post)=>{
                            if(String(post._id)===String(postId)){
                                let updatedPost = post;
                                let updatedPostComments = updatedPost.postComments.map((postComment)=>{
                                    if(String(postComment._id)===String(commentId)){
                                        if(isLiked){
                                            let updatedComment = postComment;
                                            updatedComment.commentLikes.push(newLike);
                                            return updatedComment;
                                        }else{
                                            let updatedComment = postComment;
                                            let updatedLikes = updatedComment.commentLikes.filter((commentLike)=>{
                                                return commentLike._id!==newLike._id;
                                            })
                                            updatedComment.commentLikes = updatedLikes;
                                            return updatedComment;
                                        }
                                    }else{
                                        return postComment;
                                    }
                                })
                                updatedPost.postComments = updatedPostComments;
                                return updatedPost;
                            }else{
                                return post;
                            }
                        })
                        return updatedPosts;
                    })
    
                })


            } 
        }
    }, [socketRef, user, setOnlineUsers, setIsTyping, setTypingChatIds, setSelectedConversationId, setSelectedConversationInfo, setChats, setMessages, setIsRecording, setRecordingChatIds, setShowConversation, setNotifications, setMoreNotificationsToSkip, setUnreadNotificationsPresent, location.pathname, location.search, playSendSound, setUnreadMessagesPresent, setMessagesNotifications, setPosts, setProfilePosts, setNewPostsAvailable])
}

