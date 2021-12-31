import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import CreatePost from '../../components/createPost/CreatePost';
import SinglePost from '../../components/singlePost/SinglePost';
import authenticateUser from '../../utils/authenticateUser';
import fetchPosts from '../../utils/fetchPosts';
import Context from '../../context/Context';
import './home.css';

const Home = ()=>{

    // getting values & methods from global state
    const [posts, setPosts, user, setUser] = useContext(Context);

    const navigate = useNavigate();



    useEffect(()=>{

        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);
        // calling fetchPosts utility function that will fetch posts from backend
        fetchPosts(setPosts);

    }, [navigate, setPosts, setUser])



    return(
        user
        ?
        <>
            <Navbar/>
            <div className='home-page'>
                <CreatePost userImage={user.profileImage} userId={user._id}/>
                <div className='posts'>
                    {
                        posts.length
                        ?
                        posts.map((post)=>{
                            return <SinglePost key={post._id} post={post} loggedInUser={user}/>
                        })
                        :
                        null
                    }
                </div>
            </div>
        </>
        :
        <img src='/images/spiner2.gif' alt='loader' className='home-loader' />
    );
}

export default Home;