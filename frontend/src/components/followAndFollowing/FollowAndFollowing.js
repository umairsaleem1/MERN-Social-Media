import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Context from '../../context/Context';
import followOrUnfollow from '../../utils/followOrUnfollow';
import formatName from '../../utils/formatName';
import './followAndFollowing.css';

const FollowAndFollowing = ( {follow} )=>{
    const { _id, profileImage, name } = follow;

     // getting values & methods from global state
     const [, , user, , , , socketRef, onlineUsers] = useContext(Context);

     // state that will contain boolean either the logged in user is following this profile or not
    const [isFollowing, setIsFollowing] = useState(user.following.includes(_id));

    const [showFollowLoader, setShowFollowLoader] = useState(false);





    // handler that will be called when the user clicks on follow or following btn
    const handleFollowAndUnfollow = ()=>{
        // calling the utility function
        followOrUnfollow(_id, isFollowing, setIsFollowing, setShowFollowLoader, user, socketRef);
    }

    return(
        <div className='follow-and-following'>
            <span className='follow-and-following-link'>
                <Link to={`/profile/${_id}`}>
                    <motion.img src={profileImage} alt='profileImage' 
                        initial={{scale:1}}
                        whileTap={{scale:0.85}}
                    />
                </Link>
                {
                    (onlineUsers.includes(String(_id)))
                    &&
                    <i className="fas fa-circle" style={{color:'green', fontSize:13, position: 'absolute', bottom: 0, left: 23}}></i>
                }
                <Link to={`/profile/${_id}`} className='link-text-decoration'>
                    <p>
                        {
                            formatName(name)
                        }
                    </p>
                </Link>
            </span>


            {
                _id!==user._id
                ?
                <>
                {
                    isFollowing
                    ?
                    <button className='following' disabled={showFollowLoader} onClick={handleFollowAndUnfollow}>
                        {
                            showFollowLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            <i className="fas fa-check"></i>&nbsp;Following
                            </>
                        }
                    </button>
                    :
                    <button className='follow' disabled={showFollowLoader} onClick={handleFollowAndUnfollow}>
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
                </>
            :
            null
            }
        </div>
    );
}

export default FollowAndFollowing;