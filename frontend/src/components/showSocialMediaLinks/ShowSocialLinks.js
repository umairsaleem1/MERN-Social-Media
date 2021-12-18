import React from 'react';
import './show-social-links.css';

const ShowSocialLinks = ( { socialLinks } )=>{

    return(
        <div className='social-links-container'>
            {
            socialLinks
            ?
            <>
                {
                    socialLinks.facebook
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-facebook"></i>
                        <a href={socialLinks.facebook} target='_abc'>Facebook</a>
                    </div>
                    :
                    null
                }
                {
                    socialLinks.instagram
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-instagram"></i>
                        <a href={socialLinks.instagram} target='_abc'>Instagram</a>
                    </div>
                    :
                    null
                }
                {
                    socialLinks.twitter
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-twitter"></i>
                        <a href={socialLinks.twitter} target='_abc'>Twitter</a>
                    </div>
                    :
                    null
                }
            </>
            :
            null
            }
        </div>
    );
}

export default ShowSocialLinks;