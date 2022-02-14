require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');
const { Server} = require('socket.io');
const dbConnection = require('./utils/dbConnection');



// Constants
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000'
    }
});
const port = process.env.PORT || 8000;


// Database connection
dbConnection();



// app configuration
app.use(express.json());
app.use(cookieParser());




// routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const profileRoute = require('./routes/profile');
const chatRoute = require('./routes/chat');


app.use(authRoute);
app.use(postRoute);
app.use(profileRoute);
app.use(chatRoute);




httpServer.listen(port , ()=>console.log(`Server is running on port ${port}`));








io.on('connection', (socket)=>{ 
    console.log('A user is connected');
    socket.on('join-chat', (room)=>{ 
        socket.join(room)
    });

    socket.on('send-message', (message, room, recordedTime)=>{
        console.log('hello');
        socket.to(room).emit('receive-message', message, room, recordedTime);
    });

});