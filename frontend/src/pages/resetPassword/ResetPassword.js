import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AuthMenu from '../../components/authMenu/AuthMenu';
import { HeaderMessage, FooterMessage } from '../../components/welcomeMessage/WelcomeMessage';
import validateFieldLabelColor from '../../utils/validateFieldLabelColor';
import './resetpassword.css';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = ()=>{
    const [values, setValues] = useState({password:'', cpassword:''});

    const [focused, setFocused] = useState({password:'false', cpassword:'false'});

    const [showResetLoader, setShowResetLoader] = useState(false);

    const { token } = useParams();

    const navigate = useNavigate();

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

    const handleValuesChange = (e)=>{
        setValues({...values, [e.target.name]:e.target.value});
        validateFieldLabelColor(e);
    }

    const handleFieldBlur = (e)=>{
        setFocused({...focused, [e.target.name]:'true'});
        validateFieldLabelColor(e, true);
    }

    const handleResetPasswordSubmit = async (e)=>{
        e.preventDefault();
        setShowResetLoader(true);
        let errorMessage;
        try{
            const res = await fetch(`/resetpassword/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            if(res.status===403){
                errorMessage = 'You are not eligible for making this request';
                throw new Error(res.statusText);
            }
            else if(res.status===404){
                errorMessage = 'It seems that the reset password link has been expired, please request a new one!';
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred';
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // reseting values
            setValues({password:'', cpassword:''});
            setFocused({password:'false', cpassword:'false'});
            setShowResetLoader(false);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            setTimeout(()=>{
                navigate('/login');
            }, 2100);
        }catch(e){
            setShowResetLoader(false);
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
            <HeaderMessage heading='Reset Password'/>
            <div className='reset-password-form'>
                <form onSubmit={handleResetPasswordSubmit}>
                    <div className='resetpassword-input-container'>
                        <label className='resetpassword-input-label'>Password <sup style={{color:'red'}}>*</sup><i className="fas fa-eye resetpassword-input-icon" onClick={togglePasswordVisibility} id='pass-show'></i><i className="fas fa-eye-slash resetpassword-input-icon" id='pass-hide' ref={passHide} onClick={togglePasswordVisibility}></i></label>
                        <input type='password' className='resetpassword-inputBox' ref={passRef} placeholder='New Password' name='password' value={values.password} onChange={handleValuesChange} required pattern='^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$' onBlur={handleFieldBlur} focused={focused.password}/>
                        <span>Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!</span>
                    </div>

                    <div className='resetpassword-input-container'>
                        <label className='resetpassword-input-label'>Confirm Password <sup style={{color:'red'}}>*</sup><i className="fas fa-eye resetpassword-input-icon" onClick={togglePasswordVisibility} id='cpass-show'></i><i className="fas fa-eye-slash resetpassword-input-icon" id='cpass-hide' ref={cPassHide} onClick={togglePasswordVisibility}></i></label>
                        <input type='password' className='resetpassword-inputBox' ref={cPassRef} placeholder='Confirm Password' name='cpassword' value={values.cpassword} onChange={handleValuesChange} required pattern={values.password} onBlur={handleFieldBlur} onFocus={handleFieldBlur} focused={focused.cpassword}/>
                        <span>Password & Confirm Password does not match!</span>
                    </div>

                    <button className='resetpassword-btn' type='submit'>
                        {
                            showResetLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            <i className="fas fa-wrench"></i> Reset
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

export default ResetPassword;