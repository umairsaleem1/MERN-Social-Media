import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import CreatePost from '../../components/createPost/CreatePost';
import SinglePost from '../../components/singlePost/SinglePost';
import './home.css';

const Home = ()=>{

    // state that will contain currently logged in user data fetched from backend
    const [user, setUser] = useState(undefined);

    // state that will contain all posts written by the currently logged in user
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate();



    useEffect(()=>{
        // making request to backend to check whether the user is authorized(logged in) to access home page or not
        const authenticateUser = async ()=>{
            try{
                const res = await fetch('/authenticate', {
                    credentials: 'include'
                });

                if(!res.ok){
                    // if user is unauthorized(not logged in), then we will ask to login first
                    navigate('/login');
                    throw new Error(res.statusText);
                }
                
                const data = await res.json();
                setUser(data.user);

            }catch(e){
                console.log(e);
            }
        }

        // making request to backend to fetch posts of the currently logged in user
        const fetchPosts = async ()=>{
            try{
                const res = await fetch('/posts', {
                    credentials: 'include'
                });

                if(res.status===401){
                    // if user is unauthorized(not logged in), then we will ask to login first
                    navigate('/login');
                    throw new Error(res.statusText);
                }
                else if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setPosts(data.posts);

            }catch(e){
                console.log(e);
            }
        }


        authenticateUser();
        fetchPosts();

    }, [navigate])



    return(
        user
        ?
        <>
            <Navbar/>
            <div className='home-page'>
                <CreatePost userImage={user.profileImage}/>
                <div className='posts'>
                    {
                        posts.length
                        ?
                        posts.map((post)=>{
                            return <SinglePost key={post._id} post={post} loggedInUsername={user.username} loggedInUserRole={user.role}/>
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