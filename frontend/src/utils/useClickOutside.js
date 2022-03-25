import { useEffect, useRef } from 'react';


export const useClickOutside = (handler, isVisible)=>{
    const modal = useRef();
    
    useEffect(()=>{
        // if the targetted button(e.g post options btn '...') is visible then only this will execute
        if(isVisible){
            const modalHandler = (e)=>{
                if(!modal.current.contains(e.target)){
                    if(e.target.id==='dropdown'){
                        return;
                    }
                    else if(e.target.id==='postOptions'){
                        return;
                    }
                    else if(e.target.id==='commentOptions'){
                        return;
                    }
                    else if(e.target.id==='deleteNotificationOption'){
                        return;
                    }
                    handler();
                }
            }

            document.addEventListener('mousedown', modalHandler);

            return ()=>{
                document.removeEventListener('mousedown', modalHandler);
            }
        }
    })
    return modal;
}

