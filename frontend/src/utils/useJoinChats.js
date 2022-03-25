import { useEffect, useContext } from 'react';
import Context from '../context/Context';

export const useJoinChats = ()=>{

    // getting values & methods from global state
    const [, , , , , , socketRef, , , , , , , , , , , , setChats, , , , , , , chatHistoryFetched, setChatHistoryFetched] = useContext(Context);
    

    // useEffect to fetch user's chat history from database
    useEffect(()=>{
        const fetchChatHistory = async ()=>{
            try{
                const res = await fetch('/chats');

                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();

                setChats(data.chats);
                setChatHistoryFetched(true);

                // joining all the rooms of user's chat history so that we can listen for new messages from all rooms
                if(socketRef.current){
                    data.chats.forEach((cht)=>{
                        socketRef.current.emit('join-chat', String(cht._id));
                    })
                }

            }catch(e){
                console.log(e);
            }
        }

        if(!chatHistoryFetched){
            fetchChatHistory();
        }

    }, [chatHistoryFetched, setChatHistoryFetched, setChats, socketRef])


}
