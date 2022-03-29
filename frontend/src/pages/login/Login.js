import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import AuthMenu from '../../components/authMenu/AuthMenu';
import { HeaderMessage, FooterMessage } from '../../components/welcomeMessage/WelcomeMessage';
import './login.css';
import 'react-toastify/dist/ReactToastify.css';
import validateFieldLabelColor from '../../utils/validateFieldLabelColor';


const Login = ()=>{ 

    // state to hold form field values
    const [values, setValues] = useState({email:'', password:''});

    // state for field validation
    const [focused, setFocused] = useState({email:'false', password:'false'});

    const [showLoginLoader, setShowLoginLoader] = useState(false);

    const navigate = useNavigate();


    useEffect(()=>{
        document.title = 'Login';
    }, [])



    // References of password field & password hide
    const passRef = useRef();
    const passHide = useRef();

    // handler that will be called when the user clicks on any eye icon
    const togglePasswordVisibility = (e)=>{
        if(e.target.id==='pass-show'){
            passHide.current.style.display = 'inline-block';
            passRef.current.type = 'text';
        }
        else if(e.target.id==='pass-hide'){
            e.target.style.display = 'none';
            passRef.current.type = 'password';
        }
    }

    // handler that will be called when any input field's value changes
    const handleFieldValues = (e)=>{
        setValues({...values,[e.target.name]:e.target.value});
        // calling the utility function the manage the color of input label & icon
        validateFieldLabelColor(e);
    }


    // handler that will be called when the input field gets blurred
    const handleFieldBlur = (e)=>{
        setFocused({...focused, [e.target.name]:'true'});
        // calling the utility function the manage the color of input label & icon
        validateFieldLabelColor(e, true);
    }


    const handleFormSubmit = async (e)=>{
        e.preventDefault();
        setShowLoginLoader(true);
        let errorMessage;
        try{
            const res = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            
            if(res.status===401){
                errorMessage = 'Invalid Credentials'
                throw new Error(res.statusText);
            }
            else if(!res.ok){
                errorMessage = 'Oops! Some problem occurred'
                throw new Error(res.statusText);
            }

            const data = await res.json();

            // reseting values
            setValues({email:'', password:''});
            setFocused({email:'false', password:'false'});
            setShowLoginLoader(false);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            setTimeout(()=>{
                navigate('/');  
            }, 2100); 

        }catch(e){
            setShowLoginLoader(false);
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
            <HeaderMessage heading='Welcome Back' text='Login with Email and Password' />
            <div className='login-form-container'>
                <form onSubmit={handleFormSubmit}>
                    <div className='login-input-container'>
                        <label className='login-input-label'>Email <sup style={{color:'red'}}>*</sup><i className="fas fa-envelope login-input-icon"></i></label>
                        <input type='email' className='login-inputBox' placeholder='Email' name='email' value={values.email} onChange={handleFieldValues} required pattern='[a-z0-9]+@[a-z]+\.[a-z]{2,3}' onBlur={handleFieldBlur} focused={focused.email}/>
                        <span>It should be a valid email address!</span>
                    </div>

                    <div className='login-input-container'>
                        <label className='login-input-label'>Password <sup style={{color:'red'}}>*</sup><i className="fas fa-eye login-input-icon" onClick={togglePasswordVisibility} id='pass-show'></i><i className="fas fa-eye-slash login-input-icon" id='pass-hide' ref={passHide} onClick={togglePasswordVisibility}></i></label>
                        <input type='password' className='login-inputBox' placeholder='Password' ref={passRef} name='password' value={values.password} onChange={handleFieldValues} required onBlur={handleFieldBlur} onFocus={handleFieldBlur} focused={focused.password}/>
                        <span>Password is required</span>
                    </div>

                    <motion.button className='login-btn' type='submit' disabled={showLoginLoader}
                        initial={{scale:1}}
                        whileTap={{scale:0.95}}
                    >
                        {
                            showLoginLoader
                            ?
                            <img src='/images/spiner2.gif' alt='loader' />
                            :
                            <>
                            <i className="fas fa-sign-in-alt"></i> Login
                        </>
                        }
                    </motion.button>
                </form>
            </div>
            <div className='forgot-password'>
                <i className="fas fa-lock"></i>
                <Link to='/forgotpassword' className='forgot-link'>Forgot Password?</Link>
            </div>
            <FooterMessage page='login'/>
            <ToastContainer theme='colored'/>
        </>
    );
}

export default Login;   