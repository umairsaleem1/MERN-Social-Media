
const fetchProfileUser = async (profileUserId, navigate, setProfileUser)=>{
    try{
        const res = await fetch(`/profile/${profileUserId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===401){
            navigate('/login');
            throw new Error(res.statusText);
        }
        else if(!res.ok){
            navigate('/');
            throw new Error(res.statusText);
        }

        const data = await res.json();
        setProfileUser(data.profileUser);

    }catch(e){
        console.log(e);
    }
}

export default fetchProfileUser;