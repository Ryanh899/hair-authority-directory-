const router = require("express").Router();
const User = require('../models/user'); 
const Auth = require('../models/auth'); 
const _ = require('lodash'); 

router.post('/register', (req, res) => {
    const userInfo = _.pick(req.body, 'email', 'password', 'first_name', 'last_name', 'phone'); 
    console.log(userInfo)
    Auth.register(userInfo, res); 
});     

router.post('/login', (req, res) => {
    const attemptedUser = _.pick(req.body, 'email', 'password'); 
    Auth.logIn(attemptedUser, res)
}); 

router.post('/user-professional', async (req, res) => {
    // need to set up authentication on this route for admin only 
    const user = await User.findEmail('ryan2@gmail.com')
    console.log('user', user)
    if (user.length !== 0) {
        User.userToProfessional(user, res)
    } else {
        console.log('user not found')
        res.status(400).json({ message: 'user not found' })
    }

}); 




module.exports = router; 