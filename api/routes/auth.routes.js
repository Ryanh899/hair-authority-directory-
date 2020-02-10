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
    const user = await User.findEmail('ryan_admin@gmail.com')
    console.log('user', user)
    if (user.length !== 0 && user.isClientUser) {
        User.userToProfessional(user, res)
    } else {
        console.log('user not found')
        res.status(400).json({ message: 'user not found' })
    }

}); 

router.post('/professional-admin', async (req, res) => {
    // need to set up authentication on this route for admin only 
    console.log(req.body)
    // const userInfo = req.body
    const userInfo = {email: 'ryan_admin@gmail.com'}
    const user = await User.findEmail(userInfo.email)
    console.log('user', user)
    if (user.length !== 0 && user.isProfessionalUser) {
        User.professionalToAdmin(user, res)
    } else {
        console.log('user not found')
        res.status(400).json({ message: 'user not found' })
    }

}); 




module.exports = router; 