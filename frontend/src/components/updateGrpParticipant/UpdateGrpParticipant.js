import React, { useState } from 'react';
import './updateGrpParticipant.css';

const UpdateGrpParticipant = ()=>{
    // state to show or hide options list when clicked on participant's arrow in update Grp component's participants list individual participant
    const [showParticipantOptions, setShowParticipantOptions] = useState(false);

    return(
        <div className='update-grp-participant'>
            <img src='/images/sociallogo.png' alt='userAvatar' />
            <p>Faheem Hassan</p>
            <div className='grp-admin-tag'>Group admin</div>
            <i className="fas fa-chevron-down" onClick={()=>setShowParticipantOptions(!showParticipantOptions)} ></i>
            {
                showParticipantOptions && <div className='update-grp-participant-options'>
                    <div>Make group admin</div>
                    <div>Remove</div>
                </div>
            }
        </div>
    );
}

export default UpdateGrpParticipant;