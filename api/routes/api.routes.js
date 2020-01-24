const router = require("express").Router();
const _ = require('lodash'); 
const jwt = require('jsonwebtoken'); 
const Listings = require('../models/listings'); 
const Validate = require('../form.validation'); 

router.get('/listings', async (req, res) => {
    const user = _.pick(req.body, 'id', 'email')
    const listings = Listings.getListings(user); 
    
    listings.then(response => {
        res.json(response)
    }).catch(err => console.log(err)); 
})

router.post('/listings', (req, res) => {
    const listing = req.body
    
    Validate(listing)
})


module.exports = router; 