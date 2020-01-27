const router = require("express").Router();
const _ = require('lodash'); 
const jwt = require('jsonwebtoken'); 
const Listings = require('../models/listings'); 
const User = require('../models/user'); 


router.get('/listings/:token', async (req, res) => {
    console.log(req.params.token)
    // const user = _.pick(req.body, 'id', 'email')
    const user = jwt.decode(req.params.token)
    const listings = Listings.getListings(user); 
    listings.then(response => {
        res.json(response)
    }).catch(err => console.log(err)); 
})

router.post('/newListing', (req, res) => {
   console.log(req.body)
   console.log(req.headers)
   if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedInfo = jwt.decode(token);
    console.log(decodedInfo);
    let listing = req.body.data
    listing.professional_id = decodedInfo.id
    console.log(listing)
    if (decodedInfo.isProfessionalUser) {
        Listings.addListing(listing)
    }
   }
       
   res.json('listing created')
})

router.get('/profile/:token', (req, res) => {
    const user = jwt.decode(req.params.token); 
    console.log(user)
    User.getProfessionalProfile(user, res)
})


module.exports = router; 