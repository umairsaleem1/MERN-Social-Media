async function checkUsernameAvailable(event, usernameSpanRef, setShowUsernameLoader){
    try{
        setShowUsernameLoader(true);
        let val = event.target.value;
        let patter = event.target.pattern;
        const obj = {username:val}

        // making request to backend
        const res = await fetch('/username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        if(!res.ok){
            throw new Error(res.statusText);
        }

        await res.json();
        setShowUsernameLoader(false);
        // Username is availabe now validating the value according to the pattern
        let pattern = new RegExp(patter);
        let isValid = pattern.test(val);
        if(!isValid){
            usernameSpanRef.current.textContent = "Username should be 3-16 character and shouldn't include any special character";
        }else{
            usernameSpanRef.current.style.display = 'none';
            event.target.style.border = '1px solid green';
            event.target.style.color = 'black';
        }
    }catch(e){
        setShowUsernameLoader(false);
        // When username not available then the below code will execute
        usernameSpanRef.current.style.display = 'inline';
        usernameSpanRef.current.style.background = '#ffcfcc';
        usernameSpanRef.current.style.padding = '3px';
        usernameSpanRef.current.textContent = 'Username not available';
        event.target.previousElementSibling.style.color = 'red';
        event.target.style.border = '1px solid red';
        event.target.style.color = 'red';
        event.target.previousElementSibling.lastElementChild.style.color = 'red';
        console.log(e);
    }
}



export default checkUsernameAvailable;