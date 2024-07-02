const express=require('express');
const user_routes=express();

const bodyParser=require('body-parser');

user_routes.use(bodyParser.json());
user_routes.use(bodyParser.urlencoded({extend:true}));

user_routes.set('view engine','ejs');
user_routes.set('views','./views');

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

const userController=require('controllers/userController');


user_routes.get('/register',userController.registerLoad);
user_routes.post('/register',upload.single(image),userController.register);



module.exports=user_routes;

