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
  console.log("router.get index");


  User.find({},(err,users)=>{
    console.log(users);
    if (err) {console.log("Hay error");return next(err);}
    return res.render('users/index',{
      users,
      req
    });
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
  imgUrl = "uploads/" + req.file.filename;
  userId = req.user._id;
  User.findByIdAndUpdate(userId, {
    imgUrl
  }, (err, image) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/user');
  });

});


module.exports = router;
