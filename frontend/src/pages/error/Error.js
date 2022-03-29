import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './error.css';


const Error = ()=>{

    useEffect(()=>{
        document.title = 'Not found!'
    }, [])

    return(
        <div className='error-page'>
            <div className='error-image'>
                <img src='images/404.png' alt='' />
            </div>
            <h1>Oops!! Page not Found</h1>
            <div className='home-btn-wrapper'>
                <NavLink to='/' style={{textDecoration:'none'}}><button className='back-btn'> Go to Homepage</button></NavLink>
            </div>
        </div>
    );
}

export default Error;