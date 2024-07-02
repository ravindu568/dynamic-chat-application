const express= require('express');
const user_routes=express.Router();

// const session=require('express-session');
// const {SESSION_SECRET}=process.env;
// user_routes.use(session({secret:SESSION_SECRET}));

user_routes.use(express.json());
user_routes.use(express.urlencoded({ extended: true }));



user_routes.use(express.static('public'));

const path=require('path');
const multer=require('multer');

const storage=multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function (req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});


const upload=multer({storage:storage});

const userController=require('../controllers/userController');


user_routes.get('/register',userController.registerLoad);
user_routes.post('/register',upload.single('image'),userController.register);

// user_routes.get('/',userController.loadLogin);
// user_routes.post('/',userController.load);


module.exports=user_routes;

