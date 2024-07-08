
const User=require('../models/userModel');
const Chat=require('../models/chatModel');
const bcrypt=require('bcrypt');



const registerLoad=async (req,res)=>{
    try {
        res.render('register');
        
    }catch (e) {
        console.log(e.message);
    }

}
const register=async (req,res)=>{
try {

    const passwordHash= await bcrypt.hash(req.body.password,10);

    const user=new User({
        name:req.body.name,
        email:req.body.email,
        password:passwordHash,
        image: 'images/'+req.file.filename
        
    });

   await user.save();

    res.render('register',{mesage:'Your Registration Successfully done!'});

    // console.log(user.name);
    // console.log(user.email);
    // console.log(user.password);
    // console.log(user.image);


}catch (e) {
    console.log(e.message);
}
}

const loadLogin=async (req,res)=>{
    try {
        res.render('login');
        
    }catch (e) {
        console.log(e.message);
    }

}

const login= async (req,res)=>{
    try {
       
        const email=req.body.email;
        const password=req.body.password;

        const userData=await User.findOne({email:email});

        if(userData){

            const passwordMatch= await bcrypt.compare(password,userData.password);
                if(passwordMatch){
                            req.session.user=userData;
                            res.redirect('/dashboard');
                }else{
                    res.render('login',{message:'Email and Password Incorrect!'});
                }

        }else{
            res.render('login',{message:'Email or passsword are incorrect'});
        }
    }catch (e) {
        console.log(e.message);
    }

}

const loadDashboard=async (req,res)=>{
    try {

       const users=await User.find({ _id: {$nin : [req.session.user._id]}});
       res.render('dashboard',{user:req.session.user,users:users});
        
    }catch (e) {
        console.log(e.message);
    }

}

const logout=async (req,res)=>{
    try {
       req.session.destroy();
       res.redirect('/')
        
    }catch (e) {
        console.log(e.message);
    }

}

const saveChat=async(req,res)=>{

try{

    var chat=new Chat({
        sender_id:req.body.sender_id,
        receiver_id:req.body.receiver_id,
        message:req.body.mesage,
        });

    var newChat=await chat.save();
    res.status(200).send({succes:true,msg:'Chat inserted',data:newChat});

}catch(error){
    res.status(400).send({succes:false,msg:error.mesage} );
}

}

module.exports={
    register,
    registerLoad,
    loadDashboard,
    login,
    loadLogin,
    logout,
    saveChat
}