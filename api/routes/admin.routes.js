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

router.get("/listing/pending/:id", async (req, res) => {
    const listingId = req.params.id;
    console.log(listingId);

    const subscription = await Zoho.subscriptionCheck__listingId(listingId); 
    const listing = await Listings.getById__pending(listingId);

    console.log(listing)
    console.log(subscription)
    if (subscription && subscription.length) {
        if (listing.professional_id !== null && listing.professional_id) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else {
            res.json({ listing })
        }
    } else {
        res.status(200).json({ listing: listing })
    }
    
  });

  router.get("/listing/:id", async (req, res) => {
    const listingId = req.params.id;
    console.log(listingId);

    const subscription = await Zoho.subscriptionCheck__listingId(listingId); 
    const listing = await Listings.getById__admin(listingId);

    console.log(listing)
    console.log(subscription)
    if (subscription && subscription.length) {
        if (listing.professional_id !== null && listing.professional_id) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else {
            res.json({ listing })
        }
    } else {
        res.status(200).json({ listing: listing })
    }
    
  });

  router.get("/search/:title", async (req, res) => {
    const title = req.params.title;
    console.log(title);

    try {
        const listing = await Listings.getBySearch__admin(title);
        res.json(listing);
    } catch (error) {
        console.error(error)
        res.status(500).json(error);
    };
    
  });

  router.get('/claims/pending', (req, res) => {
      Listings.getPendingClaims(res)
  })


module.exports = router; 