import React from 'react';
import { motion } from 'framer-motion';
import SendMessage from '../sendMessage/SendMessage';
import './imageMessagePreview.css';

const ImageMessagePreview = ( { selectedFile, setSelectedFile, preview, setPreview, message, setMessage } )=>{

    

    const cancelImagePreview = ()=>{
        setSelectedFile(undefined);
        setPreview(undefined);
    }
    return(
        <div className='image-message-preview'
            initial={{scale:0}}
            animate={{scale:1}}
            transition={{type:'tween'}}
        >
            <motion.span className='cross-icon-wrapper' onClick={cancelImagePreview}
                initial={{background:'#fff'}}
                whileTap={{background:'rgb(212, 212, 212)'}}
            >
                <svg viewBox="0 0 24 24" width="26" height="26">
                    <path fill="currentColor" d="m19.1 17.2-5.3-5.3 5.3-5.3-1.8-1.8-5.3 5.4-5.3-5.3-1.8 1.7 5.3 5.3-5.3 5.3L6.7 19l5.3-5.3 5.3 5.3 1.8-1.8z"></path>
                </svg>
            </motion.span>

            <motion.img src={preview} alt='previewImage' className='image-preview'
                initial={{opacity:0}}
                animate={{opacity:1, delay:3}}
            />

            <SendMessage selectedFile={selectedFile} setSelectedFile={setSelectedFile} setPreview={setPreview} message={message} setMessage={setMessage} />
        </div>
    );
}

export default ImageMessagePreview;