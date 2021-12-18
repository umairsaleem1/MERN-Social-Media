import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Picker from 'emoji-picker-react';
import formatDistance from 'date-fns/formatDistance';
import { useClickOutside } from '../../utils/useClickOutside';
import SingleComment from '../singleComment/SingleComment';
import EditPostModal from '../editPostModal/EditPostModal';
import './singlepost.css';

const SinglePost = ( { post, loggedInUsername, loggedInUserRole } )=>{
    const { postText, postMedia, postMediaType, postLocation, postAuthor, createdAt, updatedAt } = post;

    // selectedFile will contain the file that is selected
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();

    // state to show or hide post options list
    const [showPostOptions, setShowPostOptions] = useState(false);

    // state that will tell either the post is liked or not
    const [liked, setLiked] = useState(false);

    const [myComment, setMyComment] = useState('');

    // state to show or hide emoji picker
    const [showPicker, setShowPicker] = useState(false);

    // state that will tell either to show or hide the comment section
    const [showCommentsSection, setShowCommentsSection] = useState(false);

    // reference of of myComment text input box
    const myCommentInputRef = useRef();

    // state that contain either the post options button is visible or not
    const [isPostOptionsBtnVisible, setIsPostOptionsBtnVisible] = useState(false);

    // using custom hook useClickOutside for postOptions list
    const postOptions = useClickOutside(()=>{
        setTimeout(()=>{
            setShowPostOptions(false);
        }, 200)
    }, isPostOptionsBtnVisible);


    const [showEditPostModal, setShowEditPostModal] = useState(false);


    // changing the button visible state if the user is or the author of the post or is an admin of the app
    useEffect(()=>{
        if(loggedInUserRole==='admin' || postAuthor.username===loggedInUsername){
            setIsPostOptionsBtnVisible(true);
        }
    }, [loggedInUsername, loggedInUserRole, postAuthor.username])
    




    // create a preview(set url of selected file) , whenever selected file is changed
    useEffect(()=>{
        if(!selectedFile){
            setPreview(undefined);
            return;
        }

        // generating the url of the selected file
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return ()=>{
            URL.revokeObjectURL(objectUrl);
        }

    }, [selectedFile, setPreview])


    // handler that will set file in state when ever the user clicks on select button
    const onSelectingFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedFile(undefined);
            return;
        }
        setSelectedFile(e.target.files[0]);
    }


    // handler that will be called when user clicks on any emoji from emoji picker
    const onEmojiClick = (event, emojiObject) => {
        setMyComment(myComment + ' ' + emojiObject.emoji + ' ');
        setShowPicker(false);
        myCommentInputRef.current.focus();
    };


    const removeMyCommentImage = ()=>{
        setSelectedFile(null);
        setPreview(undefined);
    }

    return(
        <div className='singlepost'>
            <div className='userinfo'>
                <span className='userinfo-wrapper'>
                    <Link to='/profile'>
                        <motion.img src={postAuthor.profileImage} alt='profile' 
                            initial={{scale:1}}
                            whileTap={{scale:0.85}}
                        />
                    </Link>
                    <span>
                        <Link to='/profile' className='link-text-decoration'>
                            <h4>
                                {
                                    postAuthor.name.split(' ').map((item)=>{
                                        return item[0].toUpperCase()+item.slice(1)
                                    }).join(' ')
                                }
                            </h4>
                        </Link>
                        <span>
                            {
                                createdAt===updatedAt
                                ?
                                formatDistance(new Date(createdAt), new Date(), { addSuffix: true })
                                :
                                formatDistance(new Date(createdAt), new Date(), { addSuffix: true }) + '(edited)'
                            }
                        </span>
                    </span>
                </span>

                {
                    loggedInUserRole==='admin' || postAuthor.username===loggedInUsername
                    ?
                    <motion.span className='post-options' onClick={()=>setShowPostOptions(!showPostOptions)} style={showPostOptions ? {background:'#E7F3FF', color:'blue'} : {background:'#E4E6EB', color:'black'}} ref={postOptions} id='postOptions'
                        initial={{scale:1}}
                        whileTap={{scale:0.80}}
                    >
                        <p>...</p>
                    </motion.span>
                    :
                    null
                }

                
                <div className='post-options-list' style={showPostOptions ? {display:'block'} : {display:'none'}}>
                    <div style={{marginBottom:'10px'}} onClick={()=> setShowEditPostModal(true)}>
                        <i className="far fa-edit" style={{color:'green'}}></i>
                        <p>Edit post</p>
                    </div>
                    <div>
                        <i className="far fa-trash-alt" style={{color:'red'}}></i>
                        <p>Delete post</p>
                    </div>
                </div>

                {
                    showEditPostModal && <EditPostModal setShowEditPostModal={setShowEditPostModal} post={post}/>
                }
                
            </div>
            {
                postLocation
                ?
                <p className='post-location'><i className="fas fa-map-marker-alt"></i>&nbsp; {postLocation} </p>
                :
                null
            }
            {
                postText
                ?
                <p className='post-text'> {postText} </p>
                :
                null
            }

            {
                postMediaType.length
                ?
                    postMediaType==='img'
                    ?
                    <img src={postMedia} alt='post' />
                    :
                    <video controls>
                        <source src={postMedia} ></source>
                    </video>
                :
                null
            }
            <div className='post-stats'>
                <span className='post-likes-count'>
                    <span><i className="fas fa-heart"></i></span>
                    {
                        liked
                        ?
                        <p>&nbsp;&nbsp;You and 30 others</p>
                        :
                        <p>&nbsp;&nbsp;30</p>
                    }
                </span>
                <p className='post-comments-count' onClick={()=> setShowCommentsSection(!showCommentsSection)}>25 comments</p>
            </div>
            <div className='post-stats-separator'><hr/></div>
            <div className='post-reactions'>
                <motion.div onClick={()=>setLiked(!liked)} style={liked ? {color:'blue'} : null}
                    initial={{scale:1}}
                    whileTap={{scale:0.85}}
                >
                    {
                        liked
                        ?
                        <>
                        <motion.i className="fas fa-heart" style={{color:'red'}}
                            initial={{scale:0}}
                            animate={{scale:1.1}}
                            transition={{type:'spring'}}
                        ></motion.i>&nbsp;&nbsp;Liked
                        </>
                        :
                        <>
                        <i className="far fa-heart"></i>&nbsp;&nbsp;Like
                        </>
                    }
                </motion.div>
                <motion.div onClick={()=> setShowCommentsSection(true)}
                    initial={{scale:1}}
                    whileTap={{scale:0.85}}
                >
                    <i className="far fa-comment-alt"></i>&nbsp;&nbsp;Comment
                </motion.div>
            </div>
            {
                showCommentsSection && <div className='post-stats-separator'><hr/></div>
            }
            {
                showCommentsSection && <div className='post-comments-section'>
                    <div className='mycomment-div'>
                        <form>
                            <Link to='/profile'><img src='/images/sociallogo.png' alt='profile' className='profile-image'/></Link>
                            <input type='text' placeholder='Add a comment...' className='mycomment-textInput' ref={myCommentInputRef} value={myComment} onChange={(e)=> setMyComment(e.target.value)} />

                            <span title='Add an emoji' onClick={()=> setShowPicker(!showPicker)} ><i className="far fa-smile"></i></span>

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                                <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-.29.71L16 14l-2 2-6-6-4 4V7a1 1 0 011-1h14a1 1 0 011 1zm-2-7a2 2 0 11-2-2 2 2 0 012 2z"></path>
                            </svg>

                            {
                                showPicker && <Picker pickerStyle={{ position: 'absolute', right:17, top:-330}} onEmojiClick={onEmojiClick}/>
                            }
                            <input type='file' className='mycomment-Fileinput' name='myCommentImage' accept='image/*' onChange={onSelectingFile} />
                            {
                                selectedFile && <div className='mycomment-image-preview'>
                                    <motion.div onClick={removeMyCommentImage}
                                        initial={{opacity:0}}
                                        animate={{opacity:1}}
                                        transition={{delay:0.9}}
                                    >
                                        <i className="fas fa-times"></i>
                                    </motion.div>
                                    <motion.img src={preview} alt='comment' 
                                        initial={{opacity:0}}
                                        animate={{opacity:1}}
                                        transition={{delay:0.5}}
                                    />
                                </div>
                            }
                            {
                                selectedFile || myComment.length
                                ?
                                <motion.button type='submit' style={selectedFile ? {position:'absolute', right:'17px', bottom:0} : null}
                                    initial={{scale:1, opacity:0}}
                                    animate={{opacity:1}}
                                    whileTap={{scale:0.85}}
                                >Post</motion.button>
                                :
                                null
                            }
                        </form>
                    </div>
                    <div className='post-comments'>
                        <SingleComment/>
                        <SingleComment/>
                    </div>
                </div>
            }
        </div>
    );
}

export default SinglePost;