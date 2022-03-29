import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import TimeAgo from 'timeago-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useClickOutside } from '../../utils/useClickOutside';
import Context from '../../context/Context';
import './singleNotification.css';
import 'react-toastify/dist/ReactToastify.css'; 


const SingleNotification = ( { notification, setViewNotificationDetails, setClickedNotification } )=>{

    const [showDeleteNotificationOption, setShowDeleteNotificationOption] = useState(false);

    // using custom hook useClickOutside for postOptions list
    const deleteNotificationOption = useClickOutside(()=>{
        setShowDeleteNotificationOption(false);
    }, true);

    const [showDeleteNotificationLoader, setShowDeleteNotificationLoader] = useState(false);



    const [, , , , , , , onlineUsers, , , , , , , , , , , , , , , , , , , , , setNotifications, , setMoreNotificationsToSkip] = useContext(Context);


    const navigate = useNavigate();









    const handleSingleNotificationClick = ()=>{
        if(notification.notificationType==='follow'){

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

                    navigate(`/profile/${notification.notificationUserProfileId}`);

                }catch(e){
                    toast.error('Oops! some problem occurred', {
                        position:"top-center",
                        autoClose:3000
                    });
                    console.log(e);
                }
            }

            updateClickedNotification();


        }else{
            setViewNotificationDetails(true);
            setClickedNotification(notification);
        }
    }






    const handleNotificationOptionClick = (e)=>{
        e.stopPropagation();
        setShowDeleteNotificationOption(!showDeleteNotificationOption);
    }

    const handleNotificationDeleteClick = async (e)=>{
        e.stopPropagation();
        setShowDeleteNotificationLoader(true);

        try{
            const res = await fetch(`/notifications/${notification._id}`, {
                method: 'DELETE',
                credentials: 'include' 
            })

            if(!res.ok){
                throw new Error(res.statusText);
            }

            await res.json();

            // reseting values
            setShowDeleteNotificationLoader(false);
            setShowDeleteNotificationOption(false);
            setNotifications((prevNotifications)=>{
                return prevNotifications.filter((prevNotification)=>{
                    return prevNotification._id!==notification._id;
                })
            })
            setMoreNotificationsToSkip((prevNotToSkip)=>{
                return prevNotToSkip-1;
            });

            toast.success('Notification deleted successfylly', {
                position:"top-center",
                autoClose:3000
            });

        }catch(e){
            setShowDeleteNotificationLoader(false);

            toast.error('Oops! some problem occurred', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }



    return(
        <>
        <div className='notification-container' key={notification._id} style={notification.isNotificationViewed ? null : {background: '#E7F3FF'}} onClick={handleSingleNotificationClick}>
            <img src={notification.personProfileImage} alt='profileImage' />
            {
                (notification.personId && onlineUsers.includes(String(notification.personId)))
                &&
                <i className="fas fa-circle" style={{color:'green', fontSize:20, position: 'absolute', bottom: 15, left: 65}}></i>
            }
            <div className='notification'>
                <p><b>{notification.personName}</b> {' ' + notification.notificationText}</p>
                <span><TimeAgo datetime={notification.createdAt}/></span>
            </div>
            <motion.span className='notification-options' onClick={handleNotificationOptionClick} style={showDeleteNotificationOption ? {background:'#E4E6EB', color:'blue'} : {background:'#E4E6EB', color:'black'}} id='deleteNotificationOption'
                initial={{scale:1}}
                whileTap={{scale:0.85}}
            >...</motion.span>

            <div className='notification-options-list' style={showDeleteNotificationOption ? {display:'block'} : null} ref={deleteNotificationOption} >
                {
                    showDeleteNotificationLoader
                    ?
                    <img src='/images/spiner2.gif' alt='loader' />
                    :
                    <div onClick={handleNotificationDeleteClick}>
                        <i className="far fa-trash-alt"></i>
                        <p>
                            <h4>Delete</h4>
                            <span>Delete this notification</span>
                        </p>
                    </div>
                }
            </div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    )
}

export default SingleNotification;