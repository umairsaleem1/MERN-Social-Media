// function to follow or unfollow the user
const followOrUnfollow = async (_id, isFollowing, setIsFollowing, setShowFollowLoader)=>{
    setShowFollowLoader(true);
    try{
        // making requst to backend to follow or unfollow the user
        const res = await fetch(`/profile/${_id}/follow?follow=${!isFollowing}`);

        if(!res.ok){
            throw new Error(res.statusText);
        }

        const data = await res.json();

        // reseting values
        setShowFollowLoader(false);
        setIsFollowing(!isFollowing);

        console.log(data);
    }catch(e){
        setShowFollowLoader(false);
        console.log(e);
    }
}

export default followOrUnfollow;