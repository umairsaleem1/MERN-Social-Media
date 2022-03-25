import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { useClickOutside } from '../../utils/useClickOutside';
import searchUser from '../../utils/searchUser';
import Context from '../../context/Context';
import './navbar.css';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = ()=>{
    // state that will contain the value of searchBox input
    const [name, setName] = useState('');

    // getting values & methods from global state
    const [, , user, , , , , , , , , , , , , , , , , , , , , , , , , , , , , unreadNotificationsPresent, , unreadMessagesPresent] = useContext(Context);

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

    
    // state that will contain all the matched users with the searched text
    const [users, setUsers] = useState([]);

    // reference of the expanded searchBox input
    const expandedSearchInput = useRef();


    const [showLoader, setShowLoader] = useState(false);

    const [showLogoutLoader, setShowLogoutLoader] = useState(false);




    const { profileUserId } = useParams();
    useEffect(()=>{
        setName('');
        setUsers([]);
        setExpandSearch(false);
    }, [profileUserId])


    const navigate = useNavigate();



    const handleSearchInputClick = ()=>{
        setExpandSearch(true);
        setTimeout(()=>{
            expandedSearchInput.current.focus();
        }, 100)
    }


    // handler that will be called when the value of search input box changes
    const handleSearchChange = async (e)=>{
        let val = e.target.value;
        setName(val);

        // if the value is empty then do nothing
        if(e.target.value.length<1){
            setUsers([]);
            return;
        }

        setShowLoader(true);
        // calling the utility function to search matched user in database
        searchUser(val, setShowLoader, setUsers);
    }



    const logoutUser = async ()=>{
        setShowLogoutLoader(true);

        try{
            const res = await fetch('/logout');

            if(!res.ok){
                throw new Error(res.statusText);
            }

            await res.json();

            setShowLogoutLoader(false);
            navigate('/login');

        }catch(e){
            setShowLogoutLoader(false);
            toast.error('Logout Unsuccessfull', {
                position:"top-center",
                autoClose:3000
            });
            console.log(e);
        }
    }
    
    return(
        <>
        <div className='navbar'>
            <div className='logo-and-search-container'>
                <Link to='/' className='navbar-logo-link'>
                    <motion.img src='/images/sociallogo.png' alt='logo' className='navbar-logo'
                        initial={{scale:1}}
                        whileTap={{scale:0.85}} 
                    />
                </Link>
                <div className='navbar-search-container'>
                    <i className="fas fa-search" onClick={handleSearchInputClick}></i>
                    <input type='text' placeholder='Search User' onClick={handleSearchInputClick}/>
                </div>

                <div className='navbar-search-expand' ref={expandedSearch} style={expandSearch ? {display:'block'} : {display:'none'}}>
                    <div className='navbar-expand-input'>
                        <div className='navbar-search-back' onClick={()=>setExpandSearch(false)}>
                            <i className="fas fa-arrow-left"></i>
                        </div>
                        <input type='text' placeholder='Search User' ref={expandedSearchInput} value={name} onChange={handleSearchChange} />
                    </div>
                    
                    {
                        showLoader
                        ?
                            <img src='/images/spiner2.gif' alt='loader' className='user-search-loader' />
                        :
                            users.length
                            ?
                            <div className='search-result-user-wrapper'>
                                {
                                    users.map((user)=>{
                                        return(
                                            <Link to={`/profile/${user._id}`} className='link-text-decoration' key={user._id} style={{width:'auto'}}>
                                                <span className='search-result-user'>
                                                    <img src={user.profileImage} alt='profileImage' />
                                                    <h4>
                                                        {
                                                            user.name.split(' ').map((item)=>{
                                                                return item[0].toUpperCase()+item.slice(1)
                                                            }).join(' ')
                                                        }
                                                    </h4>
                                                </span>
                                            </Link>
                                        )
                                    })
                                    
                                }
                            </div>
                            :
                            name && <p className='no-searched-user'>No user found!</p>
                    }
                </div>
                
            </div>

            <div className='navbar-links-container'>
                <NavLink to='/' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    <i className="fas fa-home"></i>
                    <span className='tooltiptext'>Home</span>
                </NavLink>
                <NavLink to='/messages' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    {
                        unreadMessagesPresent && <i className="fas fa-circle" style={{color:'red', fontSize:10, position:'absolute', left:70, top:10}}></i>
                    }
                    <i className="fas fa-comment-dots"></i>
                    <span className='tooltiptext'>Messages</span>
                </NavLink>
                <NavLink to='/notifications' className={({ isActive }) => 'navbar-link tooltip' + (isActive?' active-navbar-link':'')}>
                    {
                        unreadNotificationsPresent && <i className="fas fa-circle" style={{color:'red', fontSize:10, position:'absolute', left:65, top:10}}></i>
                    }
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

                    {
                        showLogoutLoader
                        ?
                        <div className='dropdown-logout-div'>
                            <img src='/images/spiner2.gif' alt='loader' />
                        </div>
                        :
                        <div className='dropdown-logout-div' onClick={logoutUser}>
                            <div>
                                <i className="fas fa-sign-out-alt"></i>
                            </div>
                            <p>Log Out</p>
                        </div>
                    }

                </div>
            </div>
        </div>
        <ToastContainer theme='colored'/>
        </>
    );
}

export default Navbar;