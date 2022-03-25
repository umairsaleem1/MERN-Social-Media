import React from 'react';
import { NavLink } from 'react-router-dom';
import './error.css';


const Error = ()=>{
    return(
        <div className='error-page'>
            <div className='error-image'>
                <img src='images/404.png' alt='' />
            </div>
            <h1>Oops!! Page not Found</h1>
            <NavLink to='/' style={{textDecoration:'none'}}><button className='back-btn'> Go to Homepage</button></NavLink>
        </div>
    );
}

export default Error;