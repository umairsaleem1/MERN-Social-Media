import React from 'react';
import { NavLink } from 'react-router-dom';
import './authmenu.css';


const AuthMenu = ()=>{
    return(
        <div className='auth-menu'>
            <div className='auth-menu-items'>
                <NavLink to='/login' className={({ isActive }) => 'auth-menu-link' + (isActive?' active-auth-menu-link':'')} ><i className="fas fa-sign-in-alt" style={{fontSize:'1.8rem'}}></i>&nbsp; Login</NavLink>
                <NavLink to='/signup' className={({ isActive }) => 'auth-menu-link' + (isActive?' active-auth-menu-link':'')} ><i className="fas fa-user-plus" style={{fontSize:'1.8rem'}}></i>&nbsp; Signup</NavLink>
            </div>
        </div>
    );
}

export default AuthMenu;