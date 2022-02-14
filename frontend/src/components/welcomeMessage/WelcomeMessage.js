import React from 'react';
import { Link } from 'react-router-dom';
import './welcome.css';

export const HeaderMessage = ( { heading, text, fromProfile } )=>{
    return(
        <div className='header-message' style={fromProfile ? {marginTop:'90px'} : null}>
            <i className="fas fa-cogs" style={{fontSize:'2.6rem'}}></i>
            <div className='message' style={heading==='Forgot Password' || 'Reset Password' || 'Edit Profile' ? {justifyContent:'center'} : null}>
                <h4> { heading } </h4>
                <p> { text } </p>
            </div>
        </div>
    );
}



export const FooterMessage = ( { page, remember } )=>{
    return(
        <div className='footer-message'>
            <h2>?</h2>
            <p>
                {
                    page==='login'
                    ?
                    <>
                    New User? <Link to='/signup' className='signup-redirect'>Signup Here Instead</Link>
                    </>
                    :
                    <>
                    {remember ? 'Remember Password?' : 'Existing User?'} <Link to='/login' className='login-redirect'>Login Here Instead</Link>
                    </>
                }
            </p>
        </div>
    );
}

