
// making request to backend to check whether the user is authorized(logged in) or not
const authenticateUser = async (setUser, navigate)=>{
    try{
        const res = await fetch('/authenticate', {
            credentials: 'include'
        });

        if(!res.ok){
            // if user is unauthorized(not logged in), then we will ask to login first
            navigate('/login');
            throw new Error(res.statusText);
        }
        
        const data = await res.json();
        setUser(data.user);

    }catch(e){
        console.log(e);
    }
}

export default authenticateUser;
