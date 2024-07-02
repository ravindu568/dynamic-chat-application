require('dotenv').config();

var mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');

const express=require('express');

const app=express();

const http=require('http').Server(app);

const userRoutes=require('./routes/userRoutes');



app.use('/',userRoutes);

app.set('view engine', 'ejs');
app.set('views','./views');

http.listen(3000,function (){
    console.log("Server is running on port 3000");
})
