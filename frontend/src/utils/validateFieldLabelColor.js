// function to change the color of input label & icon depending upon whether the file value is valid or not
function validateFieldLabelColor(e, isFromBlured){
    let elm = e.target;
    let pattern = new RegExp(elm.pattern);
    let isValid = pattern.test(elm.value);
    if(isValid){
        elm.previousElementSibling.style.color = 'black';
        if(elm.name==='password' || elm.name==='cpassword'){
            elm.previousElementSibling.lastElementChild.style.color = 'grey';
            elm.previousElementSibling.lastElementChild.previousElementSibling.style.color = 'grey';
        }else{
            elm.previousElementSibling.lastElementChild.style.color = 'grey';
        }
    }else{
        if(isFromBlured){
            elm.previousElementSibling.style.color = 'red';
            if(elm.name==='password' || elm.name==='cpassword'){
                elm.previousElementSibling.lastElementChild.style.color = 'red';
                elm.previousElementSibling.lastElementChild.previousElementSibling.style.color = 'red';
            }else{
                elm.previousElementSibling.lastElementChild.style.color = 'red';
            }
        }
    }
}

export default validateFieldLabelColor;