import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { HeaderMessage } from '../../components/welcomeMessage/WelcomeMessage';
import Navbar from '../../components/navbar/Navbar';
import ImageUpload from '../../components/imageUpload/ImageUpload';
import SocialLinksModal from '../../components/socialLinksModal/SocialLinksModal';
import ShowSocialLinks from '../../components/showSocialMediaLinks/ShowSocialLinks';
import { EditProfileSkeleton } from '../../components/skeletons/Skeletons';
import validateFieldLabelColor from '../../utils/validateFieldLabelColor';
import authenticateUser from '../../utils/authenticateUser'
import fetchProfileUser from '../../utils/fetchProfileUser';
import Context from '../../context/Context';
import './editProfile.css';
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = ()=>{
    // getting values & methods from global state
    const [, , user, setUser] = useContext(Context);

    // state that will contain profile data of which user's id is provided in the url
    const [profileUser, setProfileUser] = useState('');


    const [selectedCoverFile, setSelectedCoverFile] = useState('');
    const [coverPreview, setCoverPreview] = useState();

    // selectedFile will contain the profileImage file that is selected
    const [selectedFile, setSelectedFile] = useState('');
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();
 
    const [values, setValues] = useState({password:'', cpassword:'', bio:''});
    // state for field validation
    const [focused, setFocused] = useState({password:'false', cpassword:'false'});
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [socialLinks, setSocialLinks] = useState({facebook:'', instagram:'', twitter:''});
    const [showUpdateProfileLoader, setShowUpdateProfileLoader] = useState(false);

    // getting user's id from url(if present)
    const { profileUserId } = useParams();

    const navigate = useNavigate();



    
    

    useEffect(()=>{

        // calling authenticateUser utility function that will check user is loggedIn or not
        authenticateUser(setUser, navigate);
        // calling fetchProfileUser utility function to fetch profile data of which user's id is provided in the url
        fetchProfileUser(profileUserId, navigate, setProfileUser);
        
    }, [navigate, setUser, profileUserId])



    // create a preview(set url of selected cover file) , whenever selected cover file is changed
    useEffect(()=>{
        if(!selectedCoverFile){
            setCoverPreview(undefined);
            return;
        }

        // generating the url of the selected cover file
        const objectUrl = URL.createObjectURL(selectedCoverFile);
        setCoverPreview(objectUrl);

        // free memory when ever this component is unmounted
        return ()=>{
            URL.revokeObjectURL(objectUrl);
        }

    }, [selectedCoverFile, setCoverPreview])



    // handler that will set file in cover file state when ever the user clicks on edit cover image button
    const onSelectingCoverFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedCoverFile(undefined);
            return;
        }
        setSelectedCoverFile(e.target.files[0]);
    }



    // References of password, confirm password field & password hide, confirm password hide icon
    const passRef = useRef();
    const cPassRef = useRef();
    const passHide = useRef();
    const cPassHide = useRef();




    // handler that will be called when the user clicks on any eye icon
    const togglePasswordVisibility = (e)=>{
        if(e.target.id==='pass-show'){
            passHide.current.style.display = 'inline-block';
            passRef.current.type = 'text';
        }
        else if(e.target.id==='cpass-show'){
            cPassHide.current.style.display = 'inline-block';
            cPassRef.current.type = 'text';
        }
        else if(e.target.id==='pass-hide'){
            e.target.style.display = 'none';
            passRef.current.type = 'password';
        }else if(e.target.id==='cpass-hide'){
            e.target.style.display = 'none';
            cPassRef.current.type = 'password';
        }
    }

    // handler that will be called when any input field's value changes
    const handleFieldValues = (e)=>{
        setValues({...values,[e.target.name]:e.target.value});
        // calling the utility function the manage the color of input label & icon
        if(e.target.name!=='bio'){
            validateFieldLabelColor(e);
        }
    }

    // handler that will be called when the input field gets blurred
    const handleFieldBlur = (e)=>{
        setFocused({...focused, [e.target.name]:'true'});

        // calling the utility function the manage the color of input label & icon
        if(e.target.name==='cpassword'){
            if(values.password.length){
                validateFieldLabelColor(e, true);
            }
        }
        else if(e.target.value.length){
            validateFieldLabelColor(e, true);
        }
    }

    // handler that will be called when the user click on add social links button
    const handleSocialBtnClick = (e)=>{
        e.preventDefault();
        setShowSocialModal(true);
    }




    // handler that will be called when the user will submit the form
    const handleEditProfileSubmit = async (e)=>{
        e.preventDefault();
        let errorMessage;
        setShowUpdateProfileLoader(true);
        try{
            // updated links if any
            let links = {};
            links.facebook = socialLinks.facebook || profileUser.socialLinks.facebook || '';
            links.instagram = socialLinks.instagram || profileUser.socialLinks.instagram || '';
            links.twitter = socialLinks.twitter || profileUser.socialLinks.twitter || '';
            // if links are not updated then setting it equal to empty string
            if(JSON.stringify(links)===JSON.stringify(profileUser.socialLinks)){
                links = '';
            }
         
            // creating formData
            let formData = new FormData();
            formData.append('coverImage', selectedCoverFile);
            formData.append('profileImage', selectedFile);
            formData.append('password', values.password);
            formData.append('cpassword', values.cpassword);
            formData.append('bio', values.bio);
            formData.append('socialLinks', JSON.stringify(links));

            

            // making request to backend to update profile
            const res = await fetch(`/profile/${profileUserId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if(res.status===401){
                errorMessage = 'User is not authenticated, please login first';
                throw new Error(res.statusText);
            }
            else if(res.status===400){
                errorMessage = 'Please make sure you have entered field values correctly';
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! some problem occurred';
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // reseting values
            setShowUpdateProfileLoader(false);
            setValues({...values, password:'', cpassword:''});
            
            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            setTimeout(()=>{
                navigate(`/profile/${profileUserId}`);
            }, 2100);
            
        }catch(e){
            setShowUpdateProfileLoader(false);
            toast.error(errorMessage, {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }

    return(
        user
        ?
        <>
            <HeaderMessage heading='Edit Profile' text='' fromProfile={true} />
            <Navbar/>
            {
                profileUser
                ?
                <div className='update-profile-form-container'>
                    <form onSubmit={handleEditProfileSubmit} encType='multipart/form-data'>
                        <div className='updatePage-cover-photo-wrapper'>
                            <div className='updatePage-cover-photo'>
                                <img src={coverPreview || profileUser.coverImage || '/images/cover.jpg'} alt='CoverPhoto' />
                                <div className='updatePage-cover-photo-update-btn'><i className="fas fa-pencil-alt"></i></div>
                                <input type='file' name='coverImage' accept='image/*' onChange={onSelectingCoverFile}/>
                            </div>
                        </div>

                        <ImageUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} preview={preview} setPreview={setPreview} profileImage={profileUser.profileImage} />

                        <div className='updatePage-input-container'>
                            <label className='updatePage-input-label'>Password<i className="fas fa-eye updatePage-input-icon" onClick={togglePasswordVisibility} id='pass-show'></i><i className="fas fa-eye-slash updatePage-input-icon" id='pass-hide' ref={passHide} onClick={togglePasswordVisibility}></i></label>
                            <input type='password' className='updatePage-inputBox' placeholder='New Password' ref={passRef} name='password' value={values.password} onChange={handleFieldValues} pattern='^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$' onBlur={handleFieldBlur} focused={focused.password}/>
                            <span>Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!</span>
                        </div>

                        <div className='updatePage-input-container'>
                            <label className='updatePage-input-label'>Confirm Password<i className="fas fa-eye updatePage-input-icon" onClick={togglePasswordVisibility} id='cpass-show'></i><i className="fas fa-eye-slash updatePage-input-icon" id='cpass-hide' ref={cPassHide} onClick={togglePasswordVisibility}></i></label>
                            <input type='password' className='updatePage-inputBox' placeholder='Confirm Password' required={Boolean(values.password)}ref={cPassRef} name='cpassword' value={values.cpassword} onChange={handleFieldValues} pattern={values.password} onBlur={handleFieldBlur} focused={focused.cpassword}/>
                            <span>Password & Confirm Password does not match!</span>
                        </div>
                        
                        <div className='updatePage-bio'>
                            <textarea placeholder='bio...' name='bio' value={values.bio || profileUser.bio} onChange={handleFieldValues}></textarea>
                        </div>

                        <ShowSocialLinks socialLinks={socialLinks} existingLinks={profileUser.socialLinks}/>
                        <motion.button className='updatePage-social-links-btn' onClick={handleSocialBtnClick}
                            initial={{scale:1}}
                            whileTap={{scale:0.95}}
                        >@ Add Social Links</motion.button>

                        { 
                            showSocialModal
                            ?
                            <SocialLinksModal setShowSocialModal={setShowSocialModal} socialLinks={socialLinks} setSocialLinks={setSocialLinks}/>
                            :
                            null
                        }

                        <br/>
                        <motion.button className='updateProfile-btn' type='submit' disabled={showUpdateProfileLoader}
                            initial={{scale:1}}
                            whileTap={{scale:0.95}}
                        >
                            {
                                showUpdateProfileLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' />
                                :
                                <>
                                <i className="fas fa-pencil-alt"></i> Save
                            </>
                            }
                        </motion.button>
                    </form>
                </div>
                :
                <EditProfileSkeleton />
            }
            <ToastContainer theme='colored'/>
        </>
        :
        null
    );
}

export default EditProfile;