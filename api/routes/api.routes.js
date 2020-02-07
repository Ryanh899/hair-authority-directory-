const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");
const GeoCode = require('../geocoding')

const googleMapClient = require('@google/maps').createClient({
  key: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo'
});

var distance = require('google-distance');
distance.apiKey = 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo';

const trimForm = function (obj) {
  // gets rid of empty responses
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
    // recurse
    else if (obj[key] == "" || obj[key] == null) delete obj[key]; // delete
  });
  return obj;
};

router.get("/listings/:token", async (req, res) => {
  console.log("params token:", req.params.token);
  // const user = _.pick(req.body, 'id', 'email')
  const user = jwt.decode(req.params.token);
  const listings = Listings.getListings(user);
  listings
    .then(response => {
      console.log(response);
      res.json(response);
    })
    .catch(err => console.log(err));
});

router.post("/newListing", (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedInfo = jwt.decode(token);
    let listing = req.body.data;
    listing.professional_id = decodedInfo.id;
    if (decodedInfo.isProfessionalUser) {
      Listings.addListing(listing);
    }
  }

  res.json("listing created");
});

router.get("/profile/:token", async (req, res) => {
  const userToken = jwt.decode(req.params.token);
  const user = await User.getProfessionalProfile(userToken);

  res.json(user);
});

router.get("/listing/:id", (req, res) => {
  const listing = req.params.id;
  console.log(listing);
  Listings.getById(listing, res);
});

router.put("/updateListing/:id", (req, res) => {
  const id = req.params.id;
  const listing = req.body;
  Listings.updateListing(listing, id);
});

router.put("/updateProfile", async (req, res) => {
  const updateInfo = req.body;
  console.log(updateInfo);
  User.updateProfessionalInfo(updateInfo, res)
});

router.get('/search/category/:category/:location', async (req, res) => {
  const category = req.params.category.split('+').join(' ')
  let location = req.params.location.split('+')
  if (location[0] === null || location[1] === null) {
    res.status(401).json({message: 'no location given'})
  }
  location = {
    lat: location[0],
    lng: location[1]
  }
  Listings.getByCategory(category, location)
    .then(resp => {
      resp.filter(item => item.distance !== false)
      console.log(resp)
      res.status(200).json(resp)
    })
    .catch(err => {
      console.log(err)
      res.status(400).json(err)
    })
})

router.get('/search/:query/:location', (req, res) => {
  const query = req.params.query
  let location = req.params.location.split('+')
  console.log(location)
  console.log(query)
  if (location[0] === 'null' || location[1] === 'null') {
    return res.status(404).json({message: 'location not found'})
  }
  location = {
    lat: location[0],
    lng: location[1]
  }
  const searchResults = [];
  Listings.getBySearch(query, location, res)
    .then(response => {
      response.forEach(listing => {
        console.log(listing.distance)
        if (listing.distance) {
          searchResults.push(listing)
        }
      })
      if (response.length !== 0) {
        Listings.getByCategory(response[0].category, location)
          .then(async resp => {
            for (var i = 0; i < resp.length; i++) {
              let length = await GeoCode.findDistance(resp[i], location)
              resp.map(item => {
                if (length < 50) {
                  item.distance = true
                } else {
                  item.distance = false
                }
              })
            }
            resp.forEach(listing => {
              if (listing.business_title !== response[0].business_title && listing.distance)
                searchResults.push(listing)
            })
            return res.status(200).json(searchResults)
          })
          .catch(err => {
            console.log(err)
          })
      } else {
        res.status(200).json(response)
      }
    })
    .catch(err => {
      console.log(err)
    })
})


module.exports = router;