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
    const delta = await Listings.getDelta__id(listingId); 

    console.log(listing)
    console.log(subscription)
    if (subscription && subscription.length) {
        listing.delta = delta
        if (listing.professional_id !== null && listing.professional_id) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else {
            res.json({ listing })
        }
    } else {
        listing.delta = delta
        res.status(200).json({ listing: listing })
    }
    
  });

  router.get("/listing/:id", async (req, res) => {
    const listingId = req.params.id;
    console.log(listingId);

    const subscription = await Zoho.subscriptionCheck__listingId(listingId); 
    const listing = await Listings.getById__admin(listingId);
    const delta = await Listings.getDelta__id(listingId); 

    console.log(listing)
    console.log(subscription)
    if (subscription && subscription.length) {
        listing.delta = delta
        if (listing.professional_id !== null && listing.professional_id) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else if ( listing.professional_id === null && subscription[0].user_id ) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else {
            res.json({ listing })
        }
    } else {
        listing.delta = delta
        res.status(200).json({ listing: listing })
    }
    
  });

  router.get("/listing/inactive/:id", async (req, res) => {
    const listingId = req.params.id;
    console.log(listingId);

    const subscription = await Zoho.subscriptionCheck__listingId(listingId); 
    const listing = await Listings.getInactiveById__admin(listingId);
    const delta = await Listings.getDelta__id(listingId); 

    console.log(listing)
    console.log(subscription)
    if (subscription && subscription.length) {
        listing.delta = delta
        if (listing.professional_id !== null && listing.professional_id) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else if ( listing.professional_id === null && subscription[0].user_id ) {
            const user = await User.getUserInfo__client(subscription[0].user_id); 
            console.log(user)
            res.json({ listing, user, subscription: subscription[0] })
        } else {
            res.json({ listing })
        }
    } else {
        listing.delta = delta
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

  router.get("/searchpending/:title", async (req, res) => {
    const title = req.params.title;
    console.log(title);

    try {
        const listing = await Listings.getPendingBySearch__admin(title);
        res.json(listing);
    } catch (error) {
        console.error(error)
        res.status(500).json(error);
    };
    
  });

  router.get('/claims/pending', (req, res) => {
      Listings.getPendingClaims(res)
  })

  router.post('/claims/verify', async (req, res) => {
    // get sub id from client
    const subscription_id = req.body.subscription 
    // hit claim table for sub id and listing id 
    const claim = await Listings.getClaimById__subscription(subscription_id); 
    if (claim.length) {
        // check if sub exists
        const subscription = await Zoho.subscriptionCheck__id(claim[0].subscription_id); 
        // if subscription exists
        if (subscription.length) {
            // gets from pending, inserts into listings w/ prof_id + claim, deletes from pending, sends resp
            Listings.verifyClaim(claim[0].listing_id, subscription[0].user_id, subscription[0].subscription_id, res); 
        }
    }

})

router.post('/pending/verify', async (req, res) => {
    // get sub id from client
    const subscription_id = req.body.subscription 
    // check if sub exists
    const subscription = await Zoho.subscriptionCheck__id(subscription_id); 
    // if subscription exists
    if (subscription.length) {
        // gets from pending, inserts into listings w/ prof_id + claim, deletes from pending, sends resp
        Listings.verifyListing(subscription[0].listing_id, subscription[0].user_id, res); 
    }

})

router.put('/listing/deactivate', async (req, res) => {
    // get sub id from client
    const subscription_id = req.body.subscription 
    // check if sub exists
    const subscription = await Zoho.subscriptionCheck__id(subscription_id); 
    // if subscription exists
    if (subscription.length) {
        // gets from pending, inserts into listings w/ prof_id + claim, deletes from pending, sends resp
        Listings.makeInactive(subscription[0].subscription_id, subscription[0].user_id, subscription[0].listing_id); 
    }

})

router.post('/claims/deny', async (req, res) => {
    // get sub id from client
    const subscription_id = req.body.subscription 
    // check if sub exists
    const subscription = await Zoho.subscriptionCheck__id(subscription_id); 
    // if subscription exists
    if (subscription.length) {
        // gets from pending, inserts into listings w/ prof_id + claim, deletes from pending, sends resp
        Zoho.denyClaim(subscription_id, res)
    }

})

router.post('/claims/unverify', async (req, res) => {
    // get sub id from client
    const subscription_id = req.body.subscription 
    // check if sub exists
    const subscription = await Zoho.subscriptionCheck__id(subscription_id); 
    // if subscription exists
    if (subscription.length) {
        // gets from pending, inserts into listings w/ prof_id + claim, deletes from pending, sends resp
        Zoho.unverifyClaim(subscription_id, res)
    }

})

router.get('/listings/inactive', (req, res) => {
    Listings.getInactiveListings(res)
})


module.exports = router; 