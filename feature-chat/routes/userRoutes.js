const express= require('express');
const user_routes=express.Router();

const session=require('express-session');
const {SESSION_SECRET}=process.env;

const auth=require('../middle/auth');

user_routes.use(session({
    secret: SESSION_SECRET,
    resave: false, // Provide resave option
    saveUninitialized: true, // Provide saveUninitialized option
    cookie: { secure: false } // Set to true if using https
  }));

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


user_routes.get('/register',auth.isLogOut,userController.registerLoad);
user_routes.post('/register',upload.single('image'),userController.register);

user_routes.get('/',auth.isLogOut,userController.loadLogin);
user_routes.post('/',userController.login);
user_routes.get('/logout',auth.isLogIn,userController.logout);

user_routes.get('/dashboard',auth.isLogIn,userController.loadDashboard);

user_routes.post('/save-chat',userController.saveChat);

user_routes.get('*', function (req, res) {
    res.render('/'); // Redirect to home or a 404 page
  });





module.exports=user_routes;

