const router = require("express").Router();
const User = require('../models/user'); 
const Auth = require('../models/auth'); 
const _ = require('lodash'); 

router.post('/register', (req, res) => {
    console.log(req.body)
    const userInfo = _.pick(req.body, 'email', 'password'); 
    console.log(userInfo)
    Auth.register(userInfo, res); 
});     

router.post('/login', (req, res) => {
    const attemptedUser = _.pick(req.body, 'email', 'password'); 
    Auth.logIn(attemptedUser, res)
})




module.exports = router; 