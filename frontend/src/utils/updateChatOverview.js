const updateChatOverview = (setChats, chatId, message, recordedTime)=>{
    let chats;
    setChats((cts)=>{
        chats = cts;
        return cts;
    });

    let updatedChats = chats.map((upchat)=>{
        if(String(upchat._id)===String(chatId)){
            let newChat = upchat;
            newChat.lastMessageDate = message.createdAt;
            newChat.lastMessage = message.text;
            if(message.messageMediaType==='img'){
                newChat.lastMessage = '<i className="fas fa-camera"></i>&nbsp;&nbsp;Photo'
            }
            if(message.messageMediaType==='aud'){
                newChat.lastMessage = `<i className="fas fa-microphone"></i>&nbsp;&nbsp;${recordedTime.m}:${recordedTime.s<10 ? '0'+recordedTime.s : recordedTime.s}`
            }

            return newChat;
        }
        else{
            return upchat;
        }
    })
    
    setChats(updatedChats);
}

export default updateChatOverview;