import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Picker from 'emoji-picker-react';
import { ToastContainer, toast } from 'react-toastify';
import { useClickOutside } from '../../utils/useClickOutside';
import Context from '../../context/Context';
import './editCommentModal.css';
import 'react-toastify/dist/ReactToastify.css';


const EditCommentModal = ( { setShowEditCommentModal, comment, postId, postAuthorId, postComments, setPostComments } )=>{
    const { _id, commentText, commentImage, commentAuthor } = comment;

    // state that will contain the textarea input field value
    const [val, setVal] = useState(commentText); 

    // selectedFile will contain the file that is selected
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();

    // state to show or hide the emoji picker
    const [showPicker, setShowPicker] = useState(false);

    // state to show or hide edit button loader
    const [showLoader, setShowLoader] = useState(false);

    // reference of textareaInuput field
    const commentTextInputRef = useRef();

    // using custom hook for edit post modal
    const editCommentModalRef = useClickOutside(()=>{
        setShowEditCommentModal(false); 
    }, true);



    // getting values & methods from global state
    const [, , user, , , , socketRef] = useContext(Context);




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
        setVal(val + emojiObject.emoji);
        setShowPicker(false);
        commentTextInputRef.current.focus();
    };



    // handler that will be called when the user clicks on comment delete option
    const handleCommentEditSubmit = async (e)=>{
        e.preventDefault();
        let errorMessage;

        // if the user does not change(edit) anything than do nothing
        if(val===commentText && !selectedFile){
            toast.error('Please make any change to Edit the comment', {
                position:"top-center",
                autoClose:3000
            });
            return;
        }

        setShowLoader(true);
        try{
            // creating formdat bcz multer only understands formdata
            let formData = new FormData();

            // checking if text is updated then add this to formdata
            if(val!==commentText){
                formData.append('commentText', val);
            }
            // checking if commentImage is updated then add this to formdata
            if(selectedFile){
                formData.append('commentImage', selectedFile);
            }
            
            // making request to backend to update comment
            const res = await fetch(`/posts/${postId}/comments/${_id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if(res.status===400){
                errorMessage = 'Please make any change to Edit the comment';
                throw new Error(res.statusText);
            }
            else if(res.status===401){
                errorMessage = 'You are not authenticated, please login first';
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred';
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // reseting values
            setShowLoader(false);
            setShowEditCommentModal(false);

            
            let newComments = postComments.map((comment)=>{
                return comment._id===data.updatedComment._id ? data.updatedComment : comment
            })
            setPostComments(newComments);
            
            
            toast.success('Comment updated successfully...', {
                position:"top-center",
                autoClose:3000
            });





            // emitting commentEditUpdate event to notify all the users about this edited comment
            socketRef.current.emit('commentEditUpdate', postId, postAuthorId, user._id, data.updatedComment)

        }catch(e){
            setShowLoader(false);
            toast.error(errorMessage, {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }
    return(
        <>
        <div className='edit-comment-modal-container'>
            <div className='edit-comment-modal' ref={editCommentModalRef}>
                <form onSubmit={handleCommentEditSubmit} encType='multipart/form-data'> 
                    <div className='edit-comment-heading'>
                        <h2>Edit comment</h2>
                    </div>
                    <div className='cross' onClick={()=> setShowEditCommentModal(false)}><i className="fas fa-times"></i></div>
                    <hr/>
                    <div className='edit-comment-top'>
                        <Link to='/profile'><img src={commentAuthor.profileImage} alt='profile' /></Link>
                        <textarea placeholder='Edit comment text' value={val} onChange={(e)=>setVal(e.target.value)} ref={commentTextInputRef} ></textarea>
                    </div>

                    {
                        (selectedFile || commentImage) && <div className='edit-comment-image-preview-wrapper'>
                            <motion.img src={preview ? preview : commentImage} alt='comment' className='edit-comment-image-preview'
                                initial={{opacity:0}}
                                animate={{opacity:1}}
                                transition={{delay:0.5}}
                            />
                        </div>
                    }

                    <div className='edit-comment-bottom'>
                        <motion.span
                                initial={{scale:1}}
                                whileTap={{scale:0.85}}
                            >
                                <input type='file' className='commentImage' name='commentImage' accept='image/*' onChange={onSelectingFile}/>
                                <svg className='edit-comment-image-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="30" height="30" focusable="false">
                                    <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-.29.71L16 14l-2 2-6-6-4 4V7a1 1 0 011-1h14a1 1 0 011 1zm-2-7a2 2 0 11-2-2 2 2 0 012 2z"></path>
                                </svg>
                                <p>Photo</p>
                        </motion.span>

                        <motion.span onClick={() => setShowPicker(!showPicker)} style={showPicker ? {background:'#E7F3FF', borderRadius:7} : null}
                            initial={{scale:1}}
                            whileTap={{scale:0.85}}
                        >
                            <i className="far fa-laugh" style={{fontSize:'1.5rem', color: '#f7b928'}}></i>
                            <p>Feelings</p>
                        </motion.span>

                        {
                            showPicker && <Picker pickerStyle={{ position: 'absolute', left:'42%', top:-330}} onEmojiClick={onEmojiClick}/>
                        }
                    </div>

                    <div className='edit-comment-btn-wrapper'>
                        <button className='edit-comment-btn' type='submit' disabled={showLoader}> 
                            {
                                showLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <>
                                Save
                                </>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default EditCommentModal;