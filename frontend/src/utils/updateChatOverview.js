const updateChatOverview = (setChats, chatId, message, recordedTime)=>{
    let chats;
    setChats((cts)=>{
        chats = cts;
        return cts;
    });


    let modifiedChat;
    let updatedChats = chats.filter((upchat)=>{

        if(String(upchat._id)===String(chatId)){
            modifiedChat = upchat;
            modifiedChat.lastMessageDate = message.createdAt;
            modifiedChat.lastMessage = message.text;
            if(message.messageMediaType==='img'){
                modifiedChat.lastMessage = '<i className="fas fa-camera"></i>&nbsp;&nbsp;Photo'
            }
            if(message.messageMediaType==='aud'){
                modifiedChat.lastMessage = `<i className="fas fa-microphone"></i>&nbsp;&nbsp;${recordedTime.m}:${recordedTime.s<10 ? '0'+recordedTime.s : recordedTime.s}`
            }

            return false;
        }
        else{
            return true;
        }
    })
    updatedChats.unshift(modifiedChat);

    setChats(updatedChats);
}

export default updateChatOverview;