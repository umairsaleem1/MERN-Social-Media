import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Navbar from '../../components/navbar/Navbar';
import CreatePost from '../../components/createPost/CreatePost';
import SinglePost from '../../components/singlePost/SinglePost';
import { PostSkeleton } from '../../components/skeletons/Skeletons';
import NoPostOrFollow from '../../components/noPostOrFollow/NoPostOrFollow';
import authenticateUser from '../../utils/authenticateUser';
import Context from '../../context/Context';
import './home.css';

const Home = ()=>{

    // getting values & methods from global state
    const [posts, setPosts, user, setUser] = useContext(Context);

    // state that will contain boolean that either request to fetch post from backend is completed or not
    const [postFetchingCompleted, setPostFetchingCompleted] = useState(false);

    // state that will contain PageNo to fetch posts from backend(1 means first 10, 2 means next 10, 3 means next 10 posts after 20 and so on)
    const [pageNo, setPageNo] = useState(1);

    // state that will contain boolean that will show either there has left any more posts to show on home page fetching from database or not
    const [hasMorePosts, setHasMorePosts] = useState(true);



    const navigate = useNavigate();






    useEffect(()=>{
        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);

    }, [navigate, setUser])




    // function that will change pageNo state in result of which below useEffect that is fetching posts will execute
    function fetchMorePosts(){
        setPageNo(pageNo+1);
    }

    useEffect(()=>{
        // making request to backend to fetch posts
        const fetchPosts = async ()=>{
            try{
                let res = await fetch(`/posts/?pageNo=${pageNo}`, {
                        credentials: 'include'
                    });
        
                if(!res.ok){
                    throw new Error(res.statusText);
                }
        
                const data = await res.json();
                setPosts((posts)=>{
                    let arr = posts.concat(data.posts)
                    return arr
                });

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
        
    }, [pageNo, setPosts])



    return(
        user
        ?
        <>
            <Navbar/>
            <div className='home-page'>
                <CreatePost userImage={user.profileImage} userId={user._id}/>
                <div className='posts' id='posts'>
                    {
                        posts.length
                        ?
                        <InfiniteScroll
                            dataLength={posts.length} 
                            next={fetchMorePosts}
                            hasMore={hasMorePosts}
                            loader={<div><PostSkeleton/><PostSkeleton/></div>}
                            endMessage={<NoPostOrFollow title='No more posts!' fromFollow={false} fromHome={true}/>}
                        >
                            {
                                [
                                    ...new Map(posts.map((item)=>[item["_id"], item])).values()
                                ].map((post)=>{
                                    return <SinglePost key={post._id} post={post} loggedInUser={user} pageNo={pageNo}/>
                                })
                            }
                        </InfiniteScroll>
                        :
                            postFetchingCompleted
                            ?
                            <NoPostOrFollow title='No more posts!' fromFollow={false} fromHome={true}/>
                            :
                            [1,2,3].map((elm)=>{
                                return <PostSkeleton key={elm} />
                            })

                    }
                </div>
            </div>
        </>
        :
        <img src='/images/spiner2.gif' alt='loader' className='home-loader' />
    );
}

export default Home;