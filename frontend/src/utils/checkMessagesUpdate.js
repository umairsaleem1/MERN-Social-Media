const checkMessagesUpdate = async (userId, setUnreadMessagesPresent)=>{
    try{
        const res = await fetch(`/notifications/${userId}?type=${"message"}`);

        if(!res.ok){
            throw new Error(res.statusText);
        }

        const data = await res.json();
        
        if(data.notification && data.notification.isNotificationOpened===false){
            setUnreadMessagesPresent(true); 
        }
    }catch(e){
        console.log(e);
    }
}

export default checkMessagesUpdate;