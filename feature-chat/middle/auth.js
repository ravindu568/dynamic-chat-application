const isLogIn= async(req,res,next)=>{
    try {
        if(req.session.user){
                
        }else{
            res.redirect('/');
        }

        next();
    } catch (error) {
        console.log(error.message);
    }
}
const isLogOut= async(req,res,next)=>{
    try {
        if(req.session.user){
         res.redirect('/dashboard');       
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogIn,
    isLogOut
}