const checkNotificationsUpdate = async (userId, setUnreadNotificationsPresent)=>{
    try{
        const res = await fetch(`/notifications/${userId}?type=${"other"}`);

        if(!res.ok){
            throw new Error(res.statusText);
        }

        const data = await res.json();
        
        if(data.notification.isNotificationOpened===false){
            setUnreadNotificationsPresent(true); 
        }
    }catch(e){
        console.log(e);
    }
}

export default checkNotificationsUpdate;