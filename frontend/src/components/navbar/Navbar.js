import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClickOutside } from '../../utils/useClickOutside';
import Context from '../../context/Context';
import './navbar.css';

const Navbar = ()=>{

    // getting values & methods from global state
    const [, , user] = useContext(Context);

    // state to show or hide the expanded search box
    const [expandSearch, setExpandSearch] = useState(false);

    // state to show or hide the profile drop down list
    const [showDropdown, setShowDropdown] = useState(false);


    // using cutom hook useClickOutside for searchBox
    const expandedSearch = useClickOutside(()=>{
        setExpandSearch(false);
    });

    // using custom hook useClickOutside for dropdown
    const dropDown = useClickOutside(()=>{
        setShowDropdown(false);
    }, true);

    
    return(
        <div className='navbar'>
            <div className='logo-and-search-container'>
                <Link to='/' className='navbar-logo-link'>
                    <motion.img src='/images/sociallogo.png' alt='logo' className='navbar-logo'
                        initial={{scale:1}}
                        whileTap={{scale:0.85}}
                    />
                </Link>
                <div className='navbar-search-container'>
                    <i className="fas fa-search" onClick={()=>setExpandSearch(true)}></i>
                    <input type='text' placeholder='Search User' onClick={()=>setExpandSearch(true)}/>
                </div>

                <div className='navbar-search-expand' ref={expandedSearch} style={expandSearch ? {display:'block'} : {display:'none'}}>
                    <div className='navbar-expand-input'>
                        <div className='navbar-search-back' onClick={()=>setExpandSearch(false)}>
                            <i className="fas fa-arrow-left"></i>
                        </div>
                        <input type='text' placeholder='Search User' />
                    </div>
                </div>
                
            </div>

            <div className='navbar-links-container'>
                <NavLink to='/' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    <i className="fas fa-home"></i>
                    <span className='tooltiptext'>Home</span>
                </NavLink>
                <NavLink to='/messages' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    <i className="fas fa-comment-dots"></i>
                    <span className='tooltiptext'>Messages</span>
                </NavLink>
                <NavLink to='/notifications' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    <i className="fas fa-bell"></i>
                    <span className='tooltiptext'>Notifications</span>
                </NavLink>
            </div>


            <div className='navbar-profile-container'>
                <Link to={`/profile/${user._id}`} className='link-text-decoration'>
                    <div className='navbar-profile-image'>
                        <img src={user.profileImage} alt='user profile' />
                        <h3>
                            {
                                user.name.split(' ').map((item)=>{
                                    return item[0].toUpperCase()+item.slice(1)
                                }).join(' ')
                            }
                        </h3>
                    </div>
                </Link>
                <motion.div className='profile-dropdown tooltip' onClick={()=>setShowDropdown(!showDropdown)} id='dropdown' style={showDropdown ? {background:'#E7F3FF', color:'blue'} : {background:'#E4E6EB', color:'black'}}
                    initial={{scale:1}}
                    whileTap={{scale:0.85}}
                >
                    <i className="fas fa-caret-down" id='dropdown'></i>
                    <span className='tooltiptext' style={{marginLeft:-50}}>Account</span>
                </motion.div>
                <div className='profile-dropdown-items' style={showDropdown ? {visibility:'visible'} : {visibility:'hidden'}} ref={dropDown}>
                    <Link to={`/profile/${user._id}`} className='link-text-decoration'>
                        <div className='dropdown-profile-div'>
                            <img src={user.profileImage} alt='profile' />
                            <div>
                                <h3>
                                    {
                                    user.name.split(' ').map((item)=>{
                                        return item[0].toUpperCase()+item.slice(1)
                                    }).join(' ')
                                    }
                                </h3>
                                <p>See your profile</p>
                            </div>
                        </div>
                    </Link>

                    <hr/>

                    <Link to='/settings' className='link-text-decoration'>
                        <div className='dropdown-settings-div'>
                            <div className='dropdown-settings-left'>
                                <div><i className="fas fa-cog"></i></div>
                                <p>Settings</p>
                            </div>
                            <div className='dropdown-settings-right'>
                            <i className="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </Link>

                    <Link to='/logout' className='link-text-decoration'>
                        <div className='dropdown-logout-div'>
                            <div>
                                <i className="fas fa-sign-out-alt"></i>
                            </div>
                            <p>Log Out</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Navbar;