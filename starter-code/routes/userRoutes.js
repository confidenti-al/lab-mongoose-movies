const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');


router.get('/signup', (req, res, next)=>{

  res.render('user-views/signup');

})


router.post('/signup', (req, res, next)=>{

  const thePassword = req.body.thePassword;
  const theUsername = req.body.theUsername;

  const salt = bcrypt.genSaltSync(12);

  const hashedPassWord = bcrypt.hashSync(thePassword, salt)

  User.create({
    username: req.body.theUsername,
    password: hashedPassWord
  })
  .then(()=>{
    console.log('yay');
    res.redirect('/');
  })
  .catch((err)=>{
    next(err);
  })
})

router.get('/login', (req, res, next)=>{

  if (req.session.errorCount <= 0){
    req.session.errorMessage = null;
  }
  req.session.errorCount -=1;

  res.render('user-views/login', {error: req.session.errorMessage});
})

router.post('/login', (req, res, next)=>{

  const password = req.body.thePassword;
  const username = req.body.theUsername;

  User.findOne({ "username": username })
  .then(user => {
      if (!user) {
        req.session.errorMessage = "sorry, no one with that username";
        req.session.errorCount = 1;
        res.redirect('/login');
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect('/');
      } else {
        req.session.errorMessage = "wrong password";
        req.session.errorCount = 1;
        res.redirect('/login');
      }
  })
  .catch(error =>{
    next(error);
  })
})


router.get('/profile', (req, res, next) => {
  if (req.session.currentUser){
    res.render('user-views/profile', {user: req.session.currentUser});
  }  else {
    req.session.errorCount = 1
    req.session.errorMessage = "Sorry you must be logged in to use this page";
    res.redirect('/login');

  }
})



router.post('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
})



module.exports = router;