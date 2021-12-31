import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import TimeAgo from 'timeago-react';
import { ToastContainer, toast } from 'react-toastify';
import { useClickOutside } from '../../utils/useClickOutside';
import EditCommentModal from '../editCommentModal/EditCommentModal';
import fetchPosts from '../../utils/fetchPosts';
import Context from '../../context/Context';
import './singlecomment.css';
import 'react-toastify/dist/ReactToastify.css';


const SingleComment = ( { postComment, postId, postAuthor } )=>{
    const { _id, commentText, commentImage, commentAuthor, commentLikes, createdAt } = postComment;

    // getting values & methods from global state
    const [,setPosts, user, , ,setProfilePosts] = useContext(Context);

    // getting user's id from url(if present)
    const { profileUserId } = useParams();
    
    // state that tell either the comment is liked or not
    const [liked, setLiked] = useState(()=>{
        return commentLikes.some((commentLike)=>{
            return commentLike._id===user._id;
        })
    });

    // state that contain value to eihter show or hide comment options list
    const [showCommentOptions, setShowCommentOptions] = useState(false);


    // state that contain either the post options button is visible or not
    const [isCommentOptionsBtnVisible, setIsCommentOptionsBtnVisible] = useState(false);

    // using custorm hook form comment options
    const commentOptions = useClickOutside(()=>{
        setTimeout(()=>{
            setShowCommentOptions(false);
        }, 200)
    }, isCommentOptionsBtnVisible);

    // changing the button visible state if the user is or the author of the comment/post or is an admin of the app
    useEffect(()=>{
        if(user.role==='admin' || commentAuthor.username===user.username || postAuthor.username===user.username){
            setIsCommentOptionsBtnVisible(true);
        }
    }, [commentAuthor.username, user.role, postAuthor.username, user.username])



    // state that will a boolean to either show or hide the comment edit modal
    const [showEditCommentModal, setShowEditCommentModal] = useState(false);






    // handler that will be called when the user clicks on comment delete option
    const handleCommentDelete = async ()=>{
        let errorMessage;
        try{
            // making request to backend to delete the comment
            const res = await fetch(`/posts/${postId}/comments/${_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.status===401){
                errorMessage = 'User is not authenticated, please login first'
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred';
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // calling fetchPosts utility function to fetch updated posts from backend to reflect on UI
            if(profileUserId){
                fetchPosts(setProfilePosts, profileUserId);
            }else{
                fetchPosts(setPosts, profileUserId);
            }

            toast.success(data.message, {
                position:"top-center",
                autoClose:3000
            });
        }catch(e){
            toast.error(errorMessage, {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }



    // handler that will be called when the user clicks on any comment's like button
    const handleCommentLike = async ()=>{
        try{
            // making request to backend to add or remove like on comment of currently loggedIn user
            const res = await fetch(`/posts/${postId}/comments/${_id}?liked=${!liked}`);
            if(!res.ok){
                throw new Error(res.statusText);
            }
        
            await res.json();

            // if liked then remove(false) it, otherwise add(true) it in state variable
            if(liked===true){
                let arr = [];
                for (let commentLike of commentLikes){
                    arr.push(commentLike._id);
                }
                let ind = arr.indexOf(user._id);
                commentLikes.splice(ind,1);
            }else{
                commentLikes.push({_id:user._id});
            }
            setLiked(!liked);

            // calling fetchPosts utility function to fetch updated posts from backend to reflect on UI
            if(profileUserId){
                fetchPosts(setProfilePosts, profileUserId);
            }else{
                fetchPosts(setPosts, profileUserId);
            }

        }catch(e){
            console.log(e);
        }
    }
    return(
        <>
        <div className='post-single-comment'>
            <Link to={`/profile/${commentAuthor._id}`}><img src={commentAuthor.profileImage} alt='profile' className='single-comment-profile-image'/></Link>
            <div className='single-comment-text'>
                <Link to={`/profile/${commentAuthor._id}`} className='link-text-decoration'>
                    <h4>
                    {
                        commentAuthor.name.split(' ').map((item)=>{
                            return item[0].toUpperCase()+item.slice(1)
                        }).join(' ')
                    }
                    </h4>
                </Link>
                <p> {commentText} </p>
                {
                    user.role==='admin' || commentAuthor.username===user.username || postAuthor.username===user.username
                    ?
                    <span className='single-comment-options' onClick={()=> setShowCommentOptions(!showCommentOptions)} style={showCommentOptions ? {color:'blue'} : {color:'rgb(99, 99, 99)'}} ref={commentOptions} id='commentOptions'>...</span>
                    :
                    null
                }
                <div className='single-comment-options-list' style={showCommentOptions ? {display:'block'} : {display:'none'}}>
                    {/* agr koi problem hoe to ye niche wali condition remove kr deni */}
                    {
                        postAuthor.username!==user.username || commentAuthor.username===postAuthor.username
                        ?
                        <div style={{marginBottom:'10px'}} onClick={()=>setShowEditCommentModal(true)}>
                            <i className="far fa-edit" style={{color:'green'}}></i>
                            <p>Edit comment</p>
                        </div>
                        :
                        null
                    }
                        <div onClick={handleCommentDelete}>
                            <i className="far fa-trash-alt" style={{color:'red'}}></i>
                            <p>Delete comment</p>
                        </div>
                </div>

                {
                    showEditCommentModal && <EditCommentModal setShowEditCommentModal={setShowEditCommentModal} comment={postComment} postId={postId}/>
                }
            </div>
            {
                commentImage
                ?
                <div className='single-comment-image-wrapper'>
                    <img src={commentImage} alt='commentImage' className='single-comment-image'/>
                </div>
                :
                null
            }
            <div className='single-comment-likes'>
                {
                    liked
                    ?
                    <span onClick={handleCommentLike} style={{color:'blue', fontWeight:'500'}}>Liked</span>
                    :
                    <span onClick={handleCommentLike}>Like</span>
                }
                <p>
                    {
                        commentLikes.length
                        ?
                        <>
                        <i className="fas fa-heart"></i> &nbsp;{commentLikes.length}
                        </>
                        :
                        null

                    }
                </p>
                <div style={{color:'rgb(99, 99, 99)'}}> <TimeAgo datetime={createdAt}/> </div>
            </div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default SingleComment;