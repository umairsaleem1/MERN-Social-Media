import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../../components/navbar/Navbar';
import CreatePost from '../../components/createPost/CreatePost';
import SinglePost from '../../components/singlePost/SinglePost';
import authenticateUser from '../../utils/authenticateUser';
import fetchPosts from '../../utils/fetchPosts';
import fetchProfileUser from '../../utils/fetchProfileUser';
import Context from '../../context/Context';
import './profile.css';
import 'react-toastify/dist/ReactToastify.css';

const Profile = ()=>{
    // state that will contain the name of active tab selected
    const [activeTab, setActiveTab] = useState('posts');

    // getting values & methods from global state
    const [,setPosts , user, setUser, profilePosts, setProfilePosts] = useContext(Context);

    // state that will contain profile data of which user's id is provided in the url
    const [profileUser, setProfileUser] = useState('');

    // getting user's id from url(if present)
    const { profileUserId } = useParams();

    const navigate = useNavigate();



   
    useEffect(()=>{

        // calling fetchProfileUser utility function to fetch profile data of which user's id is provided in the url
        fetchProfileUser(profileUserId, navigate, setProfileUser);
        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);
        // calling fetchPosts utility function to fetch updated posts from backend to reflect on UI
        if(profileUserId){
            fetchPosts(setProfilePosts, profileUserId);
        }else{
            fetchPosts(setPosts, profileUserId);
        }

    }, [navigate, setUser, profileUserId, setProfilePosts, setPosts])



    

    // handler that will be called when the user clicks on edit cover/profile photo btn
    const handleCoverAndProfilePhoto = async (e)=>{
        if(e.target.files[0]){
            let errorMessage;
            try{
                let formData = new FormData();
                if(e.target.name==='coverImage'){
                    formData.append('coverImage', e.target.files[0]);
                }else{
                    formData.append('profileImage', e.target.files[0]);
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

                if(e.target.name==='profileImage'){
                    // calling authenticateUser utility function that will check user is loggedIn or not
                    authenticateUser(setUser, navigate);

                    if(profilePosts.length>0){
                        // calling fetchPosts utility function to fetch updated posts from backend to reflect on UI
                        fetchPosts(setProfilePosts, profileUserId);
                    }
                }

            }catch(e){
                toast.error(errorMessage, {
                    position:"top-center",
                    autoClose:3000
                });
                console.log(e);
            }
        }
    }


    const handleTabClick = (e)=>{
        setActiveTab(e.target.id);
    }
    return(
        user && profileUser
        ?
        <>
            <Navbar/>
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
                </div>
            </div>
            <div className='profile-short-info-wrapper'>
                <div className='profile-short-info'>
                    <div className='profile-photo'>
                        <img src={profileUser.profileImage} alt='profilePhoto' />
                        {
                            user.username===profileUser.username 
                            &&
                            <>
                            <div className='profile-photo-update-btn'><i className="fas fa-camera"></i></div> 
                            <form>
                                <input type='file' name='profileImage' accept='image/*' onChange={handleCoverAndProfilePhoto} />
                            </form>
                        </>
                        }
                    </div>
                    <h1>
                        {
                            profileUser.name.split(' ').map((item)=>{
                                return item[0].toUpperCase()+item.slice(1)
                            }).join(' ')
                        }
                    </h1>
                    {
                        user.username===profileUser.username 
                        ?
                        <Link to='/profile/12345/update' className='link-text-decoration'>
                            <motion.div className='edit-profile-btn'
                                initial={{scale:1}}
                                whileTap={{scale:0.85}}
                            ><i className="fas fa-pencil-alt"></i> &nbsp;Edit Profile</motion.div>
                        </Link>
                        :
                        <button className='profile-follow-btn'><i className="fas fa-user-plus"></i>&nbsp;Follow</button>
                        // <button className='profile-following-btn'><i className="fas fa-check"></i>&nbsp;Following</button>
                    }
                </div>
            </div>
            <div className='profile-page-menu-tabs-wrapper'>
                <div className='profile-page-menu-tabs'>
                    <div className={'profile-menu-tab'+(activeTab==='posts' ? ' active-profile-menu-tab' : '')} id='posts' onClick={handleTabClick} >Posts</div>
                    <div className={'profile-menu-tab'+(activeTab==='followers' ? ' active-profile-menu-tab' : '')} id='followers' onClick={handleTabClick} >Followers</div>
                    <div className={'profile-menu-tab'+(activeTab==='following' ? ' active-profile-menu-tab' : '')} id='following' onClick={handleTabClick} >Following</div>
                    <div className={'profile-menu-tab'+(activeTab==='settings' ? ' active-profile-menu-tab' : '')} id='settings' onClick={handleTabClick} >Settings</div>
                </div>
            </div>
            
            {
                user.username===profileUser.username 
                &&
                <CreatePost userImage={profileUser.profileImage} userId={profileUser._id}/>
            }

            <div className='profile-posts'>
                {
                    profilePosts.length
                    ?
                    profilePosts.map((post)=>{
                        return <SinglePost key={post._id} post={post} loggedInUser={user}/>
                    })
                    :
                    null
                }
            </div>
            <ToastContainer theme='colored'/>
        </>
        :
        null

    );
}

export default Profile;