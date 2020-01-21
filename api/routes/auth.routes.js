const router = require("express").Router();
const User = require('../models/user'); 
const Auth = require('../models/auth'); 
const _ = require('lodash'); 

router.post('/register', (req, res) => {
    const userInfo = _.pick(req.body, 'email', 'password'); 
    Auth.register(userInfo, res); 
});     

router.post('/login', (req, res) => {
    const attemptedUser = _.pick(req.body, 'email', 'password'); 
    Auth.logIn(attemptedUser, res)
}); 

router.post('/user-professional', async (req, res) => {
    const user = await User.findEmail('ryan2@gmail.com')
    console.log('user', user)
    // const token = _.pick(req.headers, 'authorization'); 
    // User.userToProfessional(token)
}); 




module.exports = router; 