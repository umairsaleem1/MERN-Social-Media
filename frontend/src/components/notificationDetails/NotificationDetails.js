import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import SinglePost from '../singlePost/SinglePost';
import { PostSkeleton } from '../skeletons/Skeletons'
import Context from '../../context/Context';
import formatName from '../../utils/formatName';
import './notificationDetails.css';
import 'react-toastify/dist/ReactToastify.css';

const NotificationDetails = ( { notification, setViewNotificationDetails })=>{

    const [, , user, , , , , , , , , , , , , , , , , , , , , , , , , , setNotifications] = useContext(Context);

    const [post, setPost] = useState(null);





    useEffect(()=>{
        const fetchSinglePost = async ()=>{
            try{
                const res = await fetch(`/posts/${notification.notificationPost}`);
                
                if(!res.ok){
                    throw new Error(res.statusText)
                }

                const data = await res.json();

                setPost(data.post);
            }catch(e){
                toast.error('Oops! some problem occurred', {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(e);
            }
        }

        fetchSinglePost();

    }, [notification.notificationPost])




    useEffect(()=>{
        // function to mark the lastest(newest)(single) notification of this user as viewed(true)
        const updateClickedNotification = async ()=>{
            try{
                const res = await fetch(`/notifications/${notification._id}?type=${"other"}`, {
                    method: 'PUT',
                    credentials: 'include'
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                await res.json();

                setNotifications((prevNotifications)=>{

                    return prevNotifications.map((notif)=>{
                        if(notif._id===notification._id){
                            return {...notif, isNotificationViewed: true};
                        }else{
                            return notif;
                        }
                    })
                })

            }catch(e){
                console.log(e);
            }
        }

        if(notification.isNotificationViewed!==true){
            updateClickedNotification(); 
        }

    }, [notification._id, notification.isNotificationViewed, setNotifications])




    return(
        <>
        <div className='notification-details-container'>
            <div className='notification-details-header'>
                <motion.i className="fas fa-arrow-left" onClick={()=>setViewNotificationDetails(false)}
                    initial={{background:'#fff'}}
                    whileTap={{background:'rgba(53, 53, 53, 0.05)'}}
                ></motion.i>
                {
                    user && <h3>
                        {
                            formatName(user.name)
                        }
                    </h3>
                }
            </div>
            {
                post
                ?
                <SinglePost post={post} loggedInUser={user} pageNo={0} fromNotificationDetails={true}/>
                :
                <PostSkeleton/>
            }
        </div>
        <ToastContainer theme='colored'/>
        </>
    )
}

export default NotificationDetails;