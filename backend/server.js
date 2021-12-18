require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const dbConnection = require('./utils/dbConnection');



// Constants
const app = express();
const port = process.env.PORT || 8000;


// Database connection
dbConnection();



// app configuration
app.use(express.json());
app.use(cookieParser());




// routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');


app.use(authRoute);
app.use(postRoute);




app.listen(port , ()=>console.log(`Server is running on port ${port}`));