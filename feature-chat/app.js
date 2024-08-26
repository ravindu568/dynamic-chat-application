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

    await User.findByIdAndUpdate({_id: userId},{$set:{is_Online:'1' }});

    //user online broadcast
    socket.broadcast.emit('getOnlineUser',{user_Id:userId});

    socket.on('disconnect',async function(){

            var userId=socket.handshake.auth.token;

            await User.findByIdAndUpdate({_id: userId},{$set:{is_Online:'0' }});

            //broadcast user offline status

            socket.broadcast.emit('getOfflineUser',{user_Id:userId});

    });

    //chatting implementation

    socket.on('newChat',(data)=>{
        socket.broadcast.emit('loadNewChat',data);
    })
});





app.use('/',userRoutes);

app.set('view engine', 'ejs');
app.set('views','./views');

http.listen(3000,function (){
    console.log("Server is running on port 3000");
})
