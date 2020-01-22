const router = require("express").Router();
const _ = require('lodash'); 
const jwt = require('jsonwebtoken'); 
const Listings = require('../models/listings'); 

router.post('/listings', async (req, res) => {
    const token = _.pick(req.body, 'token'); 
    const user = await jwt.decode(token); 
    const listings = Listings.getListings(user); 
    listings.then(response => {
        console.log(response)
    })
})


module.exports = router; 