import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AuthMenu from '../../components/authMenu/AuthMenu';
import { HeaderMessage, FooterMessage } from '../../components/welcomeMessage/WelcomeMessage';
import ImageUpload from '../../components/imageUpload/ImageUpload';
import SocialLinksModal from '../../components/socialLinksModal/SocialLinksModal';
import ShowSocialLinks from '../../components/showSocialMediaLinks/ShowSocialLinks';
import './signup.css';
import 'react-toastify/dist/ReactToastify.css';
import validateFieldLabelColor from '../../utils/validateFieldLabelColor';
import checkUsernameAvailable from '../../utils/checkUsernameAvailable';



const Signup = ()=>{
    // selectedFile will contain the file that is selected
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();

    // state to hold form field values
    const [values, setValues] = useState({name:'', email:'', password:'', cpassword:'', username:'', bio:''});

    // state for field validation
    const [focused, setFocused] = useState({name:'false', email:'false', password:'false', cpassword:'false', username:'false'});
    
    // state that contain boolean to eihter show the social media links modal or not
    const [showSocialModal, setShowSocialModal] = useState(false);

    // state that will contain the social links
    const [socialLinks, setSocialLinks] = useState({facebook:'', instagram:'', twitter:''});

    // state to hide or show the signup button loader depending upon the state value(loader will be visible when the request to backend is made untill the response is received)
    const [showSignupLoader, setShowSignupLoader] = useState(false);

    // state to hide or show the username field loader(lodaer will be visible when the the request to backend is made untill the response is received)
    const [showUsernameLoader, setShowUsernameLoader] = useState(false);

    const navigate = useNavigate();
    

    // References of password, confirm password field & password hide, confirm password hide icon
    const passRef = useRef();
    const cPassRef = useRef();
    const passHide = useRef();
    const cPassHide = useRef();
    const usernameSpanRef = useRef();

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
        if(e.target.name==='username'){
            // calling the utility function to check whether the username is available the user is typing
            checkUsernameAvailable(e, usernameSpanRef, setShowUsernameLoader);
        }
    }

    // handler that will be called when the input field gets blurred
    const handleFieldBlur = (e)=>{
        setFocused({...focused, [e.target.name]:'true'});
        // calling the utility function the manage the color of input label & icon
        validateFieldLabelColor(e, true);
    }
    
    // handler that will be called when the user click on add social links button
    const handleSocialBtnClick = (e)=>{
        e.preventDefault();
        setShowSocialModal(true);
    }

    
    // handler that will be called when the user submits the signup form
    const handleFormSubmit = async (e)=>{
        e.preventDefault();
        setShowSignupLoader(true);
        let errorMessage;
        try{
            // creating form-data bcz multer only accepts formdata
            let formData = new FormData();
            formData.append('profileImage', selectedFile);
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('cpassword', values.cpassword);
            formData.append('username', values.username);
            formData.append('bio', values.bio);
            formData.append('facebook', socialLinks.facebook);
            formData.append('instagram', socialLinks.instagram);
            formData.append('twitter', socialLinks.twitter);
            

            // sending request to backend
            const res = await fetch('/signup', {  
                method: 'POST',
                body:formData
            });

            if(res.status===400){
                errorMessage = 'It seems, you already have an account'
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred'
                throw new Error(res.statusText);
            }

            const data = await res.json();
    
            // reseting values
            setSelectedFile(undefined);
            setValues({name:'', email:'', password:'', cpassword:'', username:'', bio:''});
            setFocused({name:'false', email:'false', password:'false', cpassword:'false', username:'false'});
            setSocialLinks({facebook:'', instagram:'', twitter:''});
            setShowSignupLoader(false);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            setTimeout(()=>{
                navigate('/login');
            }, 2100);
        }catch(e){
            setShowSignupLoader(false);
            toast.error(errorMessage, {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }
   


    return(
        <>
            <AuthMenu/>
            <HeaderMessage heading='Get Started' text='Create New Account' />
            <div className='signup-form-container'>

                <form onSubmit={handleFormSubmit} encType='multipart/form-data'>
                    <ImageUpload selectedFile={selectedFile} setSelectedFile={setSelectedFile} preview={preview} setPreview={setPreview}/>

                    <div className='signup-input-container'>
                        <label className='signup-input-label'>Name <sup style={{color:'red'}}>*</sup><i className="fas fa-user signup-input-icon"></i></label>
                        <input type='text' className='signup-inputBox' placeholder='Name' name='name' value={values.name} onChange={handleFieldValues} required pattern='^[A-Za-z]{3,16}$' onBlur={handleFieldBlur} focused={focused.name}/>
                        <span>Name should be 3-16 character and shouldn't include any special character or number!</span>
                    </div>

                    <div className='signup-input-container'>
                        <label className='signup-input-label'>Email <sup style={{color:'red'}}>*</sup><i className="fas fa-envelope signup-input-icon"></i></label>
                        <input type='email' className='signup-inputBox' placeholder='Email' name='email' value={values.email} onChange={handleFieldValues} required pattern='[a-z0-9]+@[a-z]+\.[a-z]{2,3}' onBlur={handleFieldBlur} focused={focused.email}/>
                        <span>It should be a valid email address!</span>
                    </div>

                    <div className='signup-input-container'>
                        <label className='signup-input-label'>Password <sup style={{color:'red'}}>*</sup><i className="fas fa-eye signup-input-icon" onClick={togglePasswordVisibility} id='pass-show'></i><i className="fas fa-eye-slash signup-input-icon" id='pass-hide' ref={passHide} onClick={togglePasswordVisibility}></i></label>
                        <input type='password' className='signup-inputBox' placeholder='Password' ref={passRef} name='password' value={values.password} onChange={handleFieldValues} required pattern='^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$' onBlur={handleFieldBlur} focused={focused.password}/>
                        <span>Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!</span>
                    </div>

                    <div className='signup-input-container'>
                        <label className='signup-input-label'>Confirm Password <sup style={{color:'red'}}>*</sup><i className="fas fa-eye signup-input-icon" onClick={togglePasswordVisibility} id='cpass-show'></i><i className="fas fa-eye-slash signup-input-icon" id='cpass-hide' ref={cPassHide} onClick={togglePasswordVisibility}></i></label>
                        <input type='password' className='signup-inputBox' placeholder='Confirm Password' ref={cPassRef} name='cpassword' value={values.cpassword} onChange={handleFieldValues} required pattern={values.password} onBlur={handleFieldBlur} focused={focused.cpassword}/>
                        <span>Password & Confirm Password does not match!</span>
                    </div>

                    <div className='signup-input-container'>
                        <label className='signup-input-label'>Username <sup style={{color:'red'}}>*</sup>
                            {
                                showUsernameLoader
                                ?
                                <img src='/images/spiner2.gif' alt='loader' className='signup-input-icon username-loader' />
                                :
                                <i className="fas fa-check signup-input-icon"></i>
                            }
                        </label>
                        <input type='text' className='signup-inputBox' placeholder='Username' name='username' value={values.username} onChange={handleFieldValues} required pattern='^[A-Za-z0-9]{3,16}$' onBlur={handleFieldBlur} onFocus={handleFieldBlur} focused={focused.username}/>
                        <span ref={usernameSpanRef}>Oop! Username not available</span>
                    </div>

                    <div className='bio'>
                        <textarea placeholder='bio...' name='bio' value={values.bio} onChange={handleFieldValues}></textarea>
                    </div>

                    <ShowSocialLinks socialLinks={socialLinks}/>
                    <motion.button className='signup-social-links-btn' onClick={handleSocialBtnClick}
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
                    <motion.button className='signup-btn' type='submit'
                        initial={{scale:1}}
                        whileTap={{scale:0.95}}
                    >
                        {
                            showSignupLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            <i className="fas fa-user-plus"></i> Signup
                            </> 
                        }
                    </motion.button>
                    
                </form>
            </div>
            <FooterMessage/>
            <ToastContainer theme='colored'/>
        </>
    );
}

export default Signup;