const router = require("express").Router();
const _ = require('lodash'); 
const jwt = require('jsonwebtoken'); 
const Listings = require('../models/listings'); 
const User = require('../models/user'); 

const trimForm = function(obj) {
    // gets rid of empty responses
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
      // recurse
      else if (obj[key] == "" || obj[key] == null) delete obj[key]; // delete
    });
    return obj;
  };

router.get('/listings/:token', async (req, res) => {
    console.log('params token:', req.params.token)
    // const user = _.pick(req.body, 'id', 'email')
    const user = jwt.decode(req.params.token)
    const listings = Listings.getListings(user); 
    listings.then(response => {
        console.log(response)
        res.json(response)
    }).catch(err => console.log(err)); 
})

router.post('/newListing', (req, res) => {
   if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedInfo = jwt.decode(token);
    let listing = req.body.data
    listing.professional_id = decodedInfo.id
    if (decodedInfo.isProfessionalUser) {
        Listings.addListing(listing)
    }
   }
       
   res.json('listing created')
})

router.get('/profile/:token', async (req, res) => {
    const userToken = jwt.decode(req.params.token); 
    const user = await User.getProfessionalProfile(userToken)
    const userInfo = await User.getProfessionalInfo(user[0].id)
    if (userInfo[0]) {
        userInfo[0].email = user[0].email
        userInfo[0].id = user[0].id 
    }
        console.log(userInfo)
        res.json(userInfo); 

})

router.get('/listing/:id', (req, res) =>  {
    const listing = req.params.id; 
    console.log(listing)
    Listings.findOne(listing, res)
})

router.put('/updateListing/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body)
    const listing = req.body
    console.log(listing)
    Listings.updateListing(listing, id)
})

router.put('/updateProfile', async (req, res) => {
    const updateInfo = req.body
    console.log(updateInfo)
    // const infoTest = User.infoCheck(updateInfo)
    if (updateInfo.email) {
        const changeEmail = await User.changeProfessionalEmail({email: updateInfo.email, id: updateInfo.professional_id})
        console.log(changeEmail)
        console.log('--------------')
        if (changeEmail === false) {
            res.status(401).json({message: 'That email is already taken'})
        }
        updateInfo.email = null
        const trimmedForm = trimForm(updateInfo)
        console.log(trimmedForm)
        User.updateProfessionalInfo(trimmedForm)
    } else {
        User.updateProfessionalInfo(updateInfo)
        res.status(200).send('fuck it ')
    }

})

module.exports = router; 