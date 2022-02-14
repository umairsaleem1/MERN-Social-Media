import React from 'react';
import './show-social-links.css';

const ShowSocialLinks = ( { socialLinks, existingLinks } )=>{
    return(
        <div className='social-links-container'>
            {
            socialLinks || existingLinks
            ?
            <>
                {
                    socialLinks.facebook || existingLinks.facebook
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-facebook"></i>
                        <a href={socialLinks.facebook || existingLinks.facebook} target='_abc'>Facebook</a>
                    </div>
                    :
                    null
                }
                {
                    socialLinks.instagram || existingLinks.instagram
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-instagram"></i>
                        <a href={socialLinks.instagram || existingLinks.instagram} target='_abc'>Instagram</a>
                    </div>
                    :
                    null
                }
                {
                    socialLinks.twitter || existingLinks.twitter
                    ?
                    <div className='show-social-media-link'>
                        <i className="fab fa-twitter"></i>
                        <a href={socialLinks.twitter || existingLinks.twitter} target='_abc'>Twitter</a>
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