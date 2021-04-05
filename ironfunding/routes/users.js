const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
let upload = multer({
  dest: './public/uploads/'
});
const {ensureLoggedIn} = require('connect-ensure-login');

/* GET users listing. */
router.get('/listing', (req, res, next)=> {

  User.find({},(err,users)=>{
    if (err) {console.log("error");return next(err);}
    return res.render('users/index',{
      users,
      req
    });
  });

});

router.get('/edit/:username', ensureLoggedIn('/login'), (req,res,next)=>{

  User.findOne({username:req.params.username},(err,user)=>{

    if (err) return next(err);
    return res.render('users/edit',{
      user,req
    });
  });
});

router.post('/edit/:id',ensureLoggedIn('/login'),(req,res,next)=>{
  console.log("id a buscar: "+req.params.id);
  const updates = {
    email: req.body.email,
    description: req.body.description,
  };
  User.findByIdAndUpdate(req.params.id,updates,(err,user)=>{
    console.log(user);
    if (err) {console.log("ERROR");return next(err);}
    return res.redirect('/user');
  });
});


router.get('/:username', ensureLoggedIn('/login'), (req, res, next) => {
  User.findOne({
    username: req.params.username
  }, (err, user) => {
    if (err) {console.log("Hay error");return next(err);}
    return res.render('users/user', {
      user,
      req
    });
  });
});

router.post('/upload', ensureLoggedIn('/login'), upload.single('profileImage'), (req, res) => {

  userId = req.user._id;

  let imgUrl;
  if (req.body.photoProfileUrl != undefined && req.body.photoProfileUrl !== ""){
      imgUrl = req.body.photoProfileUrl;
  } else {
      imgUrl = "/uploads/" + req.file.filename;
  }

  User.findByIdAndUpdate(userId, {
    imgUrl
  }, (err, user) => {
    if (err) {
      return next(err);
    }

    return res.redirect('/user');
  });

});


module.exports = router;
