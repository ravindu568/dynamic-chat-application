
const User=require('../models/userModel');
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

    console.log(user.name);
    console.log(user.email);
    console.log(user.password);
    console.log(user.image);


}catch (e) {
    console.log(e.message);
}
}


module.exports={
    register,
    registerLoad
}