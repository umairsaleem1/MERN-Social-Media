import React from 'react';
import { useNavigate } from 'react-router-dom';
import './noPostOrFollow.css'; 

const NoPostOrFollow = ( {title, fromFollow, fromHome} )=>{
    const navigate = useNavigate();
    return(
        <div className='no-post-or-follow' style={fromFollow ? {marginTop:'50px'} : null}>
            <h3> {title} </h3>
            {
                fromHome && <p style={{color:'#65676b'}}>Follow more friends to see more posts in your News Feed.</p>
            }
            {
                !fromHome && <button onClick={()=>navigate('/')}>Homepage</button>
            }
        </div>
    );
}

export default NoPostOrFollow;