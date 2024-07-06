require('dotenv').config();

var mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');

const express=require('express');

const app=express();

const User= require('./models/userModel');

const http=require('http').Server(app);

const userRoutes=require('./routes/userRoutes');

//configure socket.io

const io=require('socket.io')(http);

var usp=io.of('/user-namespace');//usp-user name space

usp.on('connection',async function(socket){
    console.log('User Connected');

    var userId=socket.handshake.auth.token;

    await User.findByIdAndUpdate({_id: userId},{$set:{is_online:'1' }});

    socket.on('disconnect',async function(){
            console.log('User Disconnected');

            var userId=socket.handshake.auth.token;

            await User.findByIdAndUpdate({_id: userId},{$set:{is_online:'0' }});
    });
});

// const { createServer } = require("http");
// const { Server } = require("socket.io");

// const httpServer = createServer(app);
// const io = new Server(httpServer,{});

// io.of("connection", (socket) => {
//     console.log('User Connected');

//     socket.on('disconnect',function(){
//         console.log('User Disconnected');
//     })
// });




app.use('/',userRoutes);

app.set('view engine', 'ejs');
app.set('views','./views');

http.listen(3000,function (){
    console.log("Server is running on port 3000");
})
