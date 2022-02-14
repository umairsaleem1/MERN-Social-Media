const searchUser = async (name, setShowLoader, setUsers)=>{
    try{
        const res = await fetch(`/searchUser?name=${name}`);

        if(!res.ok){
            throw new Error(res.statusText);
        }

        const data = await res.json();
        
        setShowLoader(false);
        setUsers(data.users);

    }catch(e){
        setShowLoader(false);
        console.log(e);
    }

}

export default searchUser;