import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import TimeAgo from 'timeago-react';
import { ToastContainer, toast } from 'react-toastify';
import useSound from 'use-sound';
import { useClickOutside } from '../../utils/useClickOutside';
import formatName from '../../utils/formatName';
import EditCommentModal from '../editCommentModal/EditCommentModal';
import Context from '../../context/Context';
import './singlecomment.css';
import 'react-toastify/dist/ReactToastify.css';
import likeSound from '../../sounds/like.mp3';


const SingleComment = ( { postComment, postId, postAuthor, postComments, setPostComments } )=>{
    const { _id, commentText, commentImage, commentAuthor, commentLikes, createdAt } = postComment;

    // getting values & methods from global state
    const [,, user, , ,, socketRef, onlineUsers] = useContext(Context);

    
    // state that tell either the comment is liked or not
    const [liked, setLiked] = useState(()=>{
        return commentLikes.some((commentLike)=>{
            return commentLike._id===user._id;
        })
    });

 
    const [showCommentOptions, setShowCommentOptions] = useState(false);
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



    const [showEditCommentModal, setShowEditCommentModal] = useState(false);
    const [showLikesList, setShowLikesList] = useState(false);
    const [playLikeSound] = useSound(likeSound);

    




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

            let newComments = postComments.filter((comment)=>{
                return _id!==comment._id;
            })
            setPostComments(newComments);

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
        setTimeout(()=>{
            playLikeSound();
        }, 500)
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
                commentLikes.push(user);
            }
            setLiked(!liked);


            // emitting likePostCommentUpdate event to notify all the users about this new like
            socketRef.current.emit('likePostCommentUpdate', postId, postAuthor._id, _id, user, !liked)

        }catch(e){
            console.log(e);
        }
    }
    return(
        <>
        <div className='post-single-comment'>
            <Link to={`/profile/${commentAuthor._id}`}><img src={commentAuthor.profileImage} alt='profile' className='single-comment-profile-image'/></Link>
            {
                (onlineUsers.includes(String(commentAuthor._id)))
                &&
                <i className="fas fa-circle" style={{color:'green', fontSize:15, position: 'absolute', top: 30, left: 50}}></i>
            }
            <div className='single-comment-text'>
                <Link to={`/profile/${commentAuthor._id}`} className='link-text-decoration'>
                    <h4>
                    {
                        formatName(commentAuthor.name)
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
                    showEditCommentModal && <EditCommentModal setShowEditCommentModal={setShowEditCommentModal} comment={postComment} postId={postId} postComments={postComments} setPostComments={setPostComments}/>
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
                <p onClick={()=>setShowLikesList(!showLikesList)}> 
                    {
                        commentLikes.length
                        ?
                        <>
                        <i className="fas fa-heart"></i> &nbsp;{commentLikes.length}
                        </>
                        :
                        null

                    }

                    {
                    showLikesList && <div className='comment-liked-persons'> 
                            <div className='comment-liked-person'>
                                {
                                    commentLikes.map((commentLike)=>{
                                        return(
                                            commentLike._id
                                            ?
                                            <Link to={`profile/${commentLike._id}`} className='link-text-decoration' key={commentLike._id}>
                                                <div>
                                                    <img src={commentLike.profileImage} alt='profile' />
                                                    <h5>
                                                        {
                                                            formatName(commentLike.name)
                                                        }
                                                    </h5>
                                                </div>
                                            </Link>
                                            :
                                            null
                                        );
                                    })   
                                }
                            </div>
                    </div>
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