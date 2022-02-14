import React, { useState } from 'react';
import Context from './Context';

const Provider = ( { children } )=>{

    // state that will contain all posts to show on home page
    const [posts, setPosts] = useState([]);

    // state that will contain posts to show on profile page
    const [profilePosts, setProfilePosts] = useState([]);

    // state that will contain currently logged in user data fetched from backend
    const [user, setUser] = useState(undefined);




    

    return(
        <Context.Provider value={[posts, setPosts, user, setUser, profilePosts, setProfilePosts]}>
            {children}
        </Context.Provider>
    );
}

export default Provider;