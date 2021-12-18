import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AuthMenu from '../../components/authMenu/AuthMenu';
import { HeaderMessage, FooterMessage } from '../../components/welcomeMessage/WelcomeMessage';
import validateFieldLabelColor from '../../utils/validateFieldLabelColor';
import './forgot.css';
import 'react-toastify/dist/ReactToastify.css';


const ForgotPassword = ()=>{
    const [email, setEmail] = useState('');

    const [focused, setFocused] = useState('false');

    const [showForgotLoader, setShowForgotLoader] = useState(false);

    const navigate = useNavigate();

    const handleForgotEmail = (e)=>{
        setEmail(e.target.value);
        validateFieldLabelColor(e);
    }

    const handleEmailBlur = (e)=>{
        setFocused('true');
        validateFieldLabelColor(e, true);
    }

    const handleForgotPasswordSubmit = async (e)=>{
        e.preventDefault();
        setShowForgotLoader(true);
        let errorMessage;
        try{
            // making request to backend
            const res = await fetch('/forgotpassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email:email})
            });

            if(res.status===404){
                errorMessage = 'User does not exist with the provided email';
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred'
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // reseting values
            setEmail('');
            setFocused('false');
            setShowForgotLoader(false);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            setTimeout(()=>{
                navigate('/login');
            }, 2100);
        }catch(e){
            setShowForgotLoader(false);
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
            <HeaderMessage heading='Forgot Password'/>
            <div className='forgot-password-form'>
                <form onSubmit={handleForgotPasswordSubmit}>
                    <div className='forgotpassword-input-container'>
                        <label className='forgotpassword-input-label'>Email <sup style={{color:'red'}}>*</sup><i className="far fa-envelope forgotpassword-input-icon"></i></label>
                        <input type='email' className='forgotpassword-inputBox' placeholder='Enter your registered email address' name='email' value={email} onChange={handleForgotEmail} required pattern='[a-z0-9]+@[a-z]+\.[a-z]{2,3}' onBlur={handleEmailBlur} focused={focused}/>
                        <span>It should be a valid email address!</span>
                    </div>

                    <button className='forgotpassword-btn' type='submit'>
                        {
                            showForgotLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            <i className="fas fa-wrench"></i> Submit
                            </>
                        }
                    </button>
                        
                </form>
            </div>
            <FooterMessage page='reset' remember={true}/>
            <ToastContainer theme='colored'/>
        </>
    );
}

export default ForgotPassword;