import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component'; 
import Navbar from '../../components/navbar/Navbar';
import CreatePost from '../../components/createPost/CreatePost';
import SinglePost from '../../components/singlePost/SinglePost';
import NoPostOrFollow from '../../components/noPostOrFollow/NoPostOrFollow';
import FollowAndFollowing from '../../components/followAndFollowing/FollowAndFollowing';
import ShowSocialLinks from '../../components/showSocialMediaLinks/ShowSocialLinks';
import { PostSkeleton, ProfileSkeleton } from '../../components/skeletons/Skeletons';
import authenticateUser from '../../utils/authenticateUser';
import fetchPosts from '../../utils/fetchPosts';
import fetchProfileUser from '../../utils/fetchProfileUser';
import followOrUnfollow from '../../utils/followOrUnfollow';
import checkNotificationsUpdate from '../../utils/checkNotificationsUpdate';
import checkMessagesUpdate from '../../utils/checkMessagesUpdate';
import { useSocket } from '../../utils/useSocket';
import { useJoinChats } from '../../utils/useJoinChats';
import formatName from '../../utils/formatName';
import Context from '../../context/Context';
import './profile.css';
import 'react-toastify/dist/ReactToastify.css';

const Profile = ()=>{
    
    const [activeTab, setActiveTab] = useState('posts'); 

    // getting values & methods from global state
    const [, , user, setUser, profilePosts, setProfilePosts, socketRef, onlineUsers, , , , , , , , , , , , , , , , , , , , , , , , , setUnreadNotificationsPresent, , setUnreadMessagesPresent] = useContext(Context);

    // state that will contain profile data of which user's id is provided in the url
    const [profileUser, setProfileUser] = useState('');
    const [postFetchingCompleted, setPostFetchingCompleted] = useState(false);

    // state that will contain boolean either the logged in user is following the profile which he is visiting(opened) of the user
    const [isFollowing, setIsFollowing] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);



    // calling custom hook for all the socket related stuff
    useSocket();
    // calling custom hook to fetch and then join all chats of currently logged in user
    useJoinChats();





    useEffect(()=>{
        if(profileUser){
            document.title = profileUser.name.split(' ').map((item)=>{
                return item[0].toUpperCase()+item.slice(1)
            }).join(' ')
        }
    }, [profileUser])

    // making call to backend to check if any new notifications present which the user has not opened yet or not(to show update indicator on top if the use has not opened the new notifications yet)
    useEffect(()=>{
        if(user){
            checkNotificationsUpdate(user._id, setUnreadNotificationsPresent);
        }
    }, [user, setUnreadNotificationsPresent])



    useEffect(()=>{
        if(user){
            checkMessagesUpdate(user._id, setUnreadMessagesPresent);
        }
    }, [user, setUnreadMessagesPresent])



    // getting user's id from url(if present)
    const { profileUserId } = useParams();

    const [showCoverPhotoLoader, setShowCoverPhotoLoader] = useState(false);
    const [showProfilePhotoLoader, setShowProfilePhotoLoader] = useState(false);
    const [showFollowLoader, setShowFollowLoader] = useState(false);

    const navigate = useNavigate();





    // setting isFollowing state based on data fetched from database
    if(profileUser && user && isFollowing===''){
        // checking if there is any field named 'following' in db then only check
        if(user.following){
            setIsFollowing(user.following.includes(profileUserId))
        }
    }
   

    // reseting values when the profileUserId is changed
    useEffect(()=>{
        setProfilePosts([]);
        setIsFollowing('');
    }, [profileUserId, setProfilePosts])

    useEffect(()=>{
        setPageNo(1);
    }, [profileUserId])



    
    useEffect(()=>{

        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);
        // calling fetchProfileUser utility function to fetch profile data of which user's id is provided in the url
        fetchProfileUser(profileUserId, navigate, setProfileUser);
        

    }, [navigate, setUser, profileUserId])




    // function that will change pageNo state in result of which below useEffect that is fetching posts will execute
    function fetchMorePosts(){
        setPageNo(pageNo+1);
    }

    useEffect(()=>{

        // making request to backend to fetch posts
        const fetchPosts = async ()=>{
            try{
                let res = await fetch(`/posts/?profileUserId=${profileUserId}&pageNo=${pageNo}`, {
                        credentials: 'include'
                    });
        
        
                if(!res.ok){
                    throw new Error(res.statusText);
                }
        
                const data = await res.json();
                if(pageNo===1){
                    setProfilePosts(data.posts);
                }else{
                    setProfilePosts((posts)=>{
                        let arr = posts.concat(data.posts)
                        return arr
                    });
                }
                

                if(data.posts.length===0){
                    setHasMorePosts(false);
                }
                
        
            }catch(e){
                console.log(e);
            }
        }
        fetchPosts();

        setTimeout(()=>{
            setPostFetchingCompleted(true);
        }, 3000)
        
    }, [pageNo, setProfilePosts, profileUserId])




    

    // handler that will be called when the user clicks on edit cover/profile photo btn
    const handleCoverAndProfilePhoto = async (e)=>{
        if(e.target.files[0]){
            let errorMessage;
            try{
                let formData = new FormData();
                if(e.target.name==='coverImage'){
                    formData.append('coverImage', e.target.files[0]);
                    setShowCoverPhotoLoader(true);
                }else{
                    formData.append('profileImage', e.target.files[0]);
                    setShowProfilePhotoLoader(true);
                }


                let res;
                if(e.target.name==='coverImage'){
                    // making request to backend to update the coverImage
                    res = await fetch(`/profile/${profileUserId}/coverImage`, {
                        method: 'PUT',
                        credentials: 'include',
                        body: formData
                    });
                }else{
                    // making request to backend to update the profileImage
                    res = await fetch(`/profile/${profileUserId}/profileImage`, {
                        method: 'PUT',
                        credentials: 'include',
                        body: formData
                    });
                }

                if(res.status===401){
                    errorMessage = 'User is no authorized, please login first'
                    throw new Error(res.statusText);
                }
                else if(res.status===400){
                    errorMessage = 'Please choose an image';
                    throw new Error(res.statusText);
                }
                else if(!res.ok){
                    errorMessage ='Oops! some problem occurred';
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                toast.success(data.message, {
                    position:"top-center",
                    autoClose:2000
                });

                // calling fetchProfileUser utility function to fetch profile data of which user's id is provided in the url
                fetchProfileUser(profileUserId, navigate, setProfileUser);


                // hiding the loader 
                if(e.target.name==='coverImage'){
                    setShowCoverPhotoLoader(false);
                }else{
                    setShowProfilePhotoLoader(false);
                }

                if(e.target.name==='profileImage'){
                    // calling authenticateUser utility function that will check user is loggedIn or not
                    authenticateUser(setUser, navigate);

                    if(profilePosts.length>0){
                        // calling fetchPosts utility function to fetch updated posts from backend to reflect on UI
                        setPageNo(1);
                        setPostFetchingCompleted(false);
                        fetchPosts(setProfilePosts, profileUserId, 1);
                        
                    }
                }

            }catch(err){
                // hiding the loader 
                if(e.target.name==='coverImage'){
                    setShowCoverPhotoLoader(false);
                }else{
                    setShowProfilePhotoLoader(false);
                }
                toast.error(errorMessage, {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(err);
            }
        }
    }



    // handler that will be called when the user clicks on follow or following btn
    const handleFollowAndUnfollow = async ()=>{
        // calling the utility function
        followOrUnfollow(profileUserId, isFollowing, setIsFollowing, setShowFollowLoader, user, socketRef);
    }



    const handleTabClick = (e)=>{
        setActiveTab(e.target.id);
    }

    return(
        user
        ?
        <>
            <Navbar/>
            {
            profileUser
            ?
            <>
            <div className='cover-photo-wrapper'>
                <div className='cover-photo'>
                    <img src={profileUser.coverImage ? profileUser.coverImage : '/images/cover.jpg'} alt='CoverPhoto' />
                    {
                        user.username===profileUser.username 
                        &&
                        <>
                        <div className='cover-photo-update-btn'><i className="fas fa-pencil-alt"></i></div>
                        <form encType='multipart/form-data'>
                            <input type='file' name='coverImage' accept='image/*' onChange={handleCoverAndProfilePhoto}/>
                        </form>
                        </>
                    }

                    {
                        showCoverPhotoLoader && <div className='cover-photo-loader'>
                            <img src='/images/spiner2.gif' alt='coverLoader' />
                        </div>
                    }
                </div>
            </div>
            <div className='profile-short-info-wrapper'>
                <div className='profile-short-info'>
                    <div className='profile-photo'>
                        <img src={profileUser.profileImage} alt='profilePhoto' />
                        {
                            (user.username!==profileUser.username && onlineUsers.includes(String(profileUser._id)))
                            &&
                            <i className="fas fa-circle" style={{color:'green', fontSize:30, position: 'absolute', bottom: 0, left: 133}}></i>
                        }
                        {
                            user.username===profileUser.username 
                            &&
                            <>
                            <div className='profile-photo-update-btn' style={showProfilePhotoLoader ? {display:'none'} : null}><i className="fas fa-camera"></i></div> 
                            <form encType='multipart/form-data' style={showProfilePhotoLoader ? {display:'none'} : null}>
                                <input type='file' name='profileImage' accept='image/*' onChange={handleCoverAndProfilePhoto} />
                            </form>
                            </>
                        }

                        {
                            showProfilePhotoLoader && <div className='profile-photo-loader'>
                                <img src='/images/spiner2.gif' alt='profileLoader' />
                            </div>
                        }
                    </div>
                    <h1>
                        {
                            formatName(profileUser.name)
                        }
                    </h1>
                    {
                        user.username===profileUser.username 
                        ?
                        <Link to={`/profile/${profileUserId}/edit`} className='link-text-decoration'>
                            <motion.div className='edit-profile-btn'
                                initial={{scale:1}}
                                whileTap={{scale:0.85}}
                            ><i className="fas fa-pencil-alt"></i> &nbsp;Edit Profile</motion.div>
                        </Link>
                        :
                            isFollowing
                            ?
                            <button className='profile-following-btn' onClick={handleFollowAndUnfollow} disabled={showFollowLoader}>
                                {
                                    showFollowLoader
                                    ?
                                    <img src='/images/spiner2.gif' alt='loader' />
                                    :
                                    <>
                                    <i className="fas fa-check-circle"></i>&nbsp;Following
                                    </>
                                }
                            </button>
                            :
                            <button className='profile-follow-btn' onClick={handleFollowAndUnfollow} disabled={showFollowLoader}>
                                {
                                    showFollowLoader
                                    ?
                                    <img src='/images/spiner2.gif' alt='loader' />
                                    :
                                    <>
                                    <i className="fas fa-user-plus"></i>&nbsp;Follow
                                    </>
                                }
                            </button>
                        
                    }
                </div>
            </div>
            <div className='profile-page-menu-tabs-wrapper'>
                <div className='profile-page-menu-tabs'>
                    <div className={'profile-menu-tab'+(activeTab==='posts' ? ' active-profile-menu-tab' : '')} id='posts' onClick={handleTabClick} >Posts</div>
                    <div className={'profile-menu-tab'+(activeTab==='followers' ? ' active-profile-menu-tab' : '')} id='followers' onClick={handleTabClick} >{profileUser.followers && <span>{profileUser.followers.length}&nbsp;</span>}Followers</div>
                    <div className={'profile-menu-tab'+(activeTab==='following' ? ' active-profile-menu-tab' : '')} id='following' onClick={handleTabClick} >{profileUser.following && <span>{profileUser.following.length}&nbsp;</span>}Following</div>
                    <div className={'profile-menu-tab'+(activeTab==='about' ? ' active-profile-menu-tab' : '')} id='about' onClick={handleTabClick} >About</div>
                </div>
            </div>
            {
                activeTab==='posts' && <div>
                    {
                        user.username===profileUser.username 
                        &&
                        <CreatePost userImage={profileUser.profileImage} userId={profileUser._id}/>
                    }

                    <div className='profile-posts'>
                        {   
                            profilePosts.length
                            ?
                            <InfiniteScroll
                                dataLength={profilePosts.length}
                                next={fetchMorePosts}
                                hasMore={hasMorePosts}
                                loader={<div><PostSkeleton/><PostSkeleton/></div>}
                                endMessage={<NoPostOrFollow title='No more posts!'/>}
                            >
                                {
                                    [
                                        ...new Map(profilePosts.map((item)=>[item["_id"], item])).values()
                                    ].map((post)=>{
                                        return <SinglePost key={post._id} post={post} loggedInUser={user} pageNo={pageNo}/>
                                    })
                                }
                            </InfiniteScroll>
                            :
                                postFetchingCompleted===true
                                ?
                                <NoPostOrFollow title='No post found!'/>
                                :
                                [1,2,3].map((elm)=>{
                                    return <PostSkeleton key={elm} />
                                })
                        }
                    </div>
                </div>
            }

            {
                activeTab==='followers' && <div>
                    {
                        profileUser.followers.length
                        ?
                        <div className='profile-followers'>
                        {
                            profileUser.followers.map((follower)=>{
                                return <FollowAndFollowing key={follower._id} follow={follower}/>
                            })
                        }
                        </div>
                        :
                        <NoPostOrFollow title='No Followers!' fromFollow={true}/>
                    }
                </div>
            }

            {
                activeTab==='following' && <div>
                    {
                        profileUser.following.length
                        ?
                        <div className='profile-following'>
                        {
                            profileUser.following.map((following)=>{
                                return <FollowAndFollowing key={following._id} follow={following}/>
                            })
                        }
                        </div>
                        :
                        <NoPostOrFollow title='No Following!' fromFollow={true}/>
                    }
                </div>
            }

            {
                activeTab==='about' && <div>
                    <div className='profile-about'>
                        <h2>
                            {
                                formatName(profileUser.name)
                            }
                        </h2>
                        {
                            profileUser.bio && <p style={{marginTop:'7px'}}> {profileUser.bio} </p>
                        }

                        <ShowSocialLinks socialLinks={profileUser.socialLinks} existingLinks={{}}/>
                        <p style={{fontSize:'1rem'}}><i style={{fontSize:'1.6rem', marginRight:'33px', color:'red'}} className="fas fa-envelope"></i> {profileUser.email}</p>
                    </div>
                </div>
            }
            </>
            :
            <>
                <ProfileSkeleton />
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            </>
            }
            <ToastContainer theme='colored'/>
        </>
        :
        <img src='/images/spiner2.gif' alt='loader' className='profile-loader' />

    );
}

export default Profile;