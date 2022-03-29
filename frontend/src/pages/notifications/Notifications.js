import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../../components/navbar/Navbar';
import { NotificationSkeleton } from '../../components/skeletons/Skeletons';
import NoPostOrFollow from '../../components/noPostOrFollow/NoPostOrFollow';
import SingleNotification from '../../components/singleNotification/SingleNotification';
import NotificationDetails from '../../components/notificationDetails/NotificationDetails';
import authenticateUser from '../../utils/authenticateUser'; 
import checkMessagesUpdate from '../../utils/checkMessagesUpdate';
import { useSocket } from '../../utils/useSocket';
import { useJoinChats } from '../../utils/useJoinChats';
import Context from '../../context/Context'; 
import './notifications.css';
import 'react-toastify/dist/ReactToastify.css';

const Notifications = ()=>{

    // getting values & methods from global state
    const [, , user, setUser, , , , , , , , , , , , , , , , , , , , , , , , notifications, setNotifications, moreNotificationsToSkip, , unreadNotificationsPresent, setUnreadNotificationsPresent, , setUnreadMessagesPresent] = useContext(Context);


    const [notificationFetchingCompleted, setNotificationFetchingCompleted] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [viewNotificationDetails, setViewNotificationDetails] = useState(false);
    const [clickedNotification, setClickedNotification] = useState(null);




    // calling custom hook for all the socket related stuff
    useSocket();
    // calling custom hook to fetch and then join all chats of currently logged in user
    useJoinChats();





    const navigate = useNavigate();








    useEffect(()=>{
        document.title = 'Notifications';
    }, [])


    useEffect(()=>{
        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);

    }, [navigate, setUser])











    // function that will change pageNo state in result of which below useEffect that is fetching notifications will execute
    function fetchMoreNotifications(){
        setPageNo(pageNo+1);
    }

    useEffect(()=>{
        // making request to backend to fetch notifications
        const fetchNotifications = async ()=>{
            try{
                let res = await fetch(`/notifications/?pageNo=${pageNo}&moreNotificationsToSkip=${moreNotificationsToSkip}&type=${"other"}`, {
                        credentials: 'include'
                    });
        
                if(!res.ok){ 
                    throw new Error(res.statusText);
                }
        
                const data = await res.json();
                setNotifications((prevNotifications)=>{
                    let arr = prevNotifications.concat(data.notifications)
                    return arr
                });

                if(data.notifications.length===0){
                    setHasMoreNotifications(false);
                }
                
        
            }catch(e){
                toast.error('Oops! some problem occurred', {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(e);
            }
        }
        fetchNotifications();



        setTimeout(()=>{
            setNotificationFetchingCompleted(true);
        }, 3000)
        
    }, [pageNo, setNotifications, moreNotificationsToSkip])






    useEffect(()=>{
        if(user){
            checkMessagesUpdate(user._id, setUnreadMessagesPresent);
        }
    }, [user, setUnreadMessagesPresent])




    useEffect(()=>{
        // function to mark the lastest(newest)(single) notification of this user as opened(true)
        const updateLatestNotification = async ()=>{
            try{
                const res = await fetch(`/notifications?type=${"other"}`, {
                    method: 'PUT',
                    credentials: 'include'
                })

                if(!res.ok){
                    throw new Error(res.statusText)
                }

                await res.json();

                setUnreadNotificationsPresent(false);

            }catch(e){
                console.log(e);
            }
        }

        updateLatestNotification();
        
    }, [setUnreadNotificationsPresent, unreadNotificationsPresent])



    return(
        user
        ?
            <>
            <Navbar/>
            <div className='notifications-container'>
                {
                    notifications && notifications.length
                    ?
                    <InfiniteScroll
                        dataLength={notifications.length} 
                        next={fetchMoreNotifications}
                        hasMore={hasMoreNotifications}
                        loader={<div><NotificationSkeleton/><NotificationSkeleton/></div>}
                        endMessage={<NoPostOrFollow title='No more Notifications!' fromFollow={false} fromHome={false} fromNotifications={true} />}
                    >
                        {
                            [
                                ...new Map(notifications.map((item)=>[item["_id"], item])).values()
                            ].map((notification)=>{
                                return <SingleNotification key={notification._id} notification={notification} setViewNotificationDetails={setViewNotificationDetails} setClickedNotification={setClickedNotification} /> 
                                    
                            })
                        }
                    </InfiniteScroll>
                    :
                        notificationFetchingCompleted
                        ?
                        <NoPostOrFollow title='No Notifications found!' fromFollow={false} fromHome={false} fromNotifications={true}/>
                        :
                        [1,2,3].map((elm)=>{
                            return <NotificationSkeleton key={elm} />
                        })    
                        
                }


                {
                    viewNotificationDetails && <NotificationDetails notification={clickedNotification} setViewNotificationDetails={setViewNotificationDetails}/>
                }
            </div>
            <ToastContainer theme='colored'/>
            </>
        :
        <img src='/images/spiner2.gif' alt='loader' className='notification-page-loader' />
    );
}

export default Notifications;