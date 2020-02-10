const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");
const GeoCode = require('../geocoding')

router.get('/pendingListings', (req, res) => {
    Listings.getPendingListings(res)
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


module.exports = router; 