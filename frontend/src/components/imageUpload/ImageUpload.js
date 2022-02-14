import React, { useEffect, useRef } from 'react';
import './imageupload.css';

const ImageUpload = ( { selectedFile, setSelectedFile, preview, setPreview, profileImage } )=>{

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




    // Refrence of the contianer where the file is to be dropped
    const dragContainer = useRef();


    // function that will checks that whether the dragged file is one of the following types or not
    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg'];
        if (validTypes.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }



     // handler that will be called when the dragged file dragged over a valid drop target every few hundred milliseconds
    const dragOver = (e)=>{
        e.preventDefault();
    }

    // handler that will be called when the dragged file enters the dropable container(dragContainer)
    const dragEnter = (e)=>{
        e.preventDefault();
        dragContainer.current.style.border = '3px dashed blue';
        dragContainer.current.style.background = 'rgb(215, 237, 255)';
    }

    // handler that will be called when the dragged file leaves the dropable container(dragContainer)
    const dragLeave = (e)=>{
        e.preventDefault();
    }

    // handler that will be called when the dragged file is dropped on the dropable container(dragContainer)
    const fileDrop = (e)=>{
        e.preventDefault();
        dragContainer.current.style.border = '2px dashed grey';
        dragContainer.current.style.background = 'rgb(237, 237, 241)';

        const file = e.dataTransfer.files[0];

        if(!file || e.dataTransfer.files.length===0){
            setSelectedFile(undefined);
            return;
        }

        // validating the file type
        const result = validateFile(file);
        if(!result){
            setSelectedFile(undefined);
            return;
        }

        setSelectedFile(file);
    }



    
    return(
        <div className='image-upload-box' onDragOver={dragOver} onDragEnter={dragEnter} onDragLeave={dragLeave} onDrop={fileDrop} ref={dragContainer}>
            {
                !selectedFile
                ?
                    profileImage
                    ?
                    <img src={profileImage} alt='preview' className='preview-image'/>
                    :
                    <>
                    <div className='drag-and-drop-icon'>
                        <img src='/images/drag.png' alt='drag' />
                        <input type='file' className='fileInput' name='profileImage' accept='image/*' onChange={onSelectingFile} required/>       
                    </div>
                    <h3>Drag n Drop or Click to upload image</h3>
                    </>
                :
                    <img src={preview} alt='preview' className='preview-image'/>
            }
        </div>
    );
}

export default ImageUpload;