import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../utils/useClickOutside';
import './singlecomment.css';

const SingleComment = ()=>{
    
    // state that tell either the post is liked or not
    const [liked, setLiked] = useState(false);
    // state that contain value to eihter show or hide comment options list
    const [showCommentOptions, setShowCommentOptions] = useState(false);

    // using custorm hook form comment options
    const commentOptions = useClickOutside(()=>{
        setShowCommentOptions(false);
    });
    return(
        <div className='post-single-comment'>
            <Link to='/profile'><img src='/images/sociallogo.png' alt='profile' className='single-comment-profile-image'/></Link>
            <div className='single-comment-text'>
                <Link to='/profile' className='link-text-decoration'><h4>Ahmad Jameel</h4></Link>
                <p>Hello, this is my first comment and it is awesome!</p>
                <span className='single-comment-date'>8mo</span>
                <span className='single-comment-options' onClick={()=> setShowCommentOptions(!showCommentOptions)} style={showCommentOptions ? {color:'blue'} : {color:'rgb(99, 99, 99)'}} ref={commentOptions} id='commentOptions'>...</span>
                <div className='single-comment-options-list' style={showCommentOptions ? {display:'block'} : {display:'none'}}>
                        <div style={{marginBottom:'10px'}}>
                            <i className="far fa-edit" style={{color:'green'}}></i>
                            <p>Edit comment</p>
                        </div>
                        <div>
                            <i className="far fa-trash-alt" style={{color:'red'}}></i>
                            <p>Delete comment</p>
                        </div>
                </div>
            </div>
            <div className='single-comment-likes'>
                {
                    liked
                    ?
                    <span onClick={()=> setLiked(false)} style={{color:'blue', fontWeight:'500'}}>Liked</span>
                    :
                    <span onClick={()=> setLiked(true)}>Like</span>
                }
                <p>
                    {
                        liked
                        ?
                        <>
                        <i className="fas fa-heart"></i> &nbsp;You and 5 others
                        </>
                        :
                        <>
                        <i className="fas fa-heart"></i> &nbsp;5
                        </>
                    }
                </p>
            </div>
        </div>
    );
}

export default SingleComment;