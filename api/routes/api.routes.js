const router = require("express").Router();
const _ = require('lodash'); 
const jwt = require('jsonwebtoken'); 
const Listings = require('../models/listings'); 

//needs to be moved, changes key name
function renameKey(obj, old_key, new_key) {    
    // check if old key = new key   
        if (old_key !== new_key) {                   
           Object.defineProperty(obj, new_key, // modify old key 
                                // fetch description from object 
           Object.getOwnPropertyDescriptor(obj, old_key)); 
           delete obj[old_key];                // delete old key 
           } 
    } 


router.get('/listings/:token', async (req, res) => {
    console.log(req.params.token)
    // const user = _.pick(req.body, 'id', 'email')
    const user = jwt.decode(req.params.token)
    const listings = Listings.getListings(user); 
    listings.then(response => {
        res.json(response)
    }).catch(err => console.log(err)); 
})

router.post('/listings', (req, res) => {
    const listing = req.body; 
    console.log(req.body)
    renameKey(listing, 'businessTitle', 'business_title')
    renameKey(listing, 'socialMedia', 'social_media')
    renameKey(listing, 'extraInfo', 'other_info')
    Listings.addListing(listing); 
    res.json({ message: 'listing created' })
})


module.exports = router; 