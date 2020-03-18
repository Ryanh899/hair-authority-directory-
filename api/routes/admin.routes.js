const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");
const GeoCode = require('../geocoding'); 
const Zoho = require('../models/zoho')

router.get('/pendingListings', (req, res) => {
    Listings.getPendingListings__recent(res)
})

router.post('/verifyListing', (req, res) => {
    const listingId = req.body.id
    console.log(req.body)

    Listings.verifyListing(listingId, res)
        
})

router.get('/pendingListing/:id', (req, res) => {
    const listingId = req.params.id

    Listings.getPendingListing(listingId, res)
})

router.get('/allListings', (req, res) => {
    Listings.getAllListings__admin(res)
})

router.get("/listing/:id", async (req, res) => {
    const listingId = req.params.id;
    console.log(listingId);

    const subscription = await Zoho.subscriptionCheck__listingId(listingId); 
    console.log(subscription)
    if (subscription && subscription.length) {
        let user; 
        const listing = await Listings.getById__pending(listingId);
        if (listing.professional_id !== null && listing.professional_id) {
            user = await User.getUserInfo__client(subscription[0].user_id); 
            res.json({ listing, user })
        } else {
            res.json({ listing })
        }
    } else {
        res.status(401).json({ message: 'User does not have subscription' })
    }
    
  });

module.exports = router; 