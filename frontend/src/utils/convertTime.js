// function to convert miliseconds to date format
const convertTime = (time)=>{
    // let hours = (new Date() - new Date(time))/(1000*60*60);
    let hours = 48;
    let lTime = new Date(time).toLocaleTimeString();
    if(hours<24){
        return 'Today ' + lTime.slice(0, lTime.length-6) + ' ' + lTime.slice(lTime.length-2);
    }
    else if(hours>23 && hours<48){
        return 'Yesterday ' + lTime.slice(0, lTime.length-6) + ' ' + lTime.slice(lTime.length-2);
    }
    else{
        return new Date(time).toLocaleDateString() + ' ' + lTime.slice(0, lTime.length-6) + ' ' + lTime.slice(lTime.length-2);
    }
}

export default convertTime;