const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");
const GeoCode = require("../geocoding");
const NodeGeocoder = require("node-geocoder");

// const googleMapClient = require("@google/maps").createClient({
//   key: "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo"
// });

// var distance = require("google-distance");
// distance.apiKey = "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo";

const options = {
  provider: "google",

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};


const geocoder = NodeGeocoder(options);

const trimForm = function(obj) {
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

router.post("/newListing", async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedInfo = jwt.decode(token);
    console.log(decodedInfo);
    let listing = req.body.data;
    console.log(listing);
    listing.professional_id = decodedInfo.id;
    if (decodedInfo.isProfessionalUser) {
      Listings.addToPending(listing);
      res.status(200).send("Listing added to pending");
    } else if (decodedInfo.isClientUser) {
      Listings.addToPending(listing);
      res.status(200).send("Listing added to pending");
    }
  }
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
  User.updateProfessionalInfo(updateInfo, res);
});

router.get("/search/category/:category/:location", async (req, res) => {
  const category = req.params.category.replace(/\+/g, "/");
  console.log(category)
  let location = req.params.location.split("+");
  if (location[0] === null || location[1] === null) {
    res.status(401).json({
      message: "no location given"
    });
  }
  const city = await geocoder.reverse({lat: Number(location[0]), lon: Number(location[1])}).catch(err => console.log(err))
  console.log(city)
  location = {
    lat: location[0],
    lng: location[1], 
    city: city[0].city.toLowerCase(), 
    state: city[0].administrativeLevels.level1short
  };
  const searchPromises = await Listings.getByCategory__single(category, location); 
    Promise.all(searchPromises).then(results => {
      console.log('SEARCH PROMISES .THEN=>')
      console.log(results)
      return results
    }).catch(err => {
      console.error(err)
      return results
    })
    .then((results) => {
      const filtered = results.filter(x => x !== 0)
      res.status(200).json(filtered)
    })
});

uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))

router.get("/search/:query/:location", async (req, res) => {
  const query = req.params.query.toLowerCase();
  
  let location = req.params.location.split("+");
  if (location[0] === "null" || location[1] === "null") {
    return res.status(404).json({
      message: "location not found"
    });
  }
  const city = await geocoder.reverse({lat: Number(location[0]), lon: Number(location[1])}).catch(err => console.log(err))
  location = {
    lat: location[0],
    lng: location[1], 
    city: city[0].city.toLowerCase(),
    state: city[0].administrativeLevels.level1short
  };
  console.log(query)
  console.log(location)
  const searchPromises = await Listings.getBySearch(query, location); 
    Promise.all(searchPromises).then(results => {
      console.log('SEARCH PROMISES .THEN=>')
      console.log(results)
      return results
    }).catch(err => {
      console.error(err)
      return results
    })
    .then((results) => {
      const filtered = results.filter(x => x !== 0)
      res.status(200).json(filtered)
    })
});

router.post("/saveListing/:id", async (req, res) => {
  console.log(req.body);
  const listingId = req.params.id;
  const user = await jwt.decode(req.body.token);
  console.log(user);
  const userId = user.id;

  if (user.isClientUser) {
    Listings.saveListing(listingId, userId, res);
  } else if (user.isProfessionalUser) {
    Listings.saveListing_professional(listingId, userId, res);
  } else if (user.isAdminUser) {
    Listings.saveListing_admin(listingId, userId, res);
  } else {
    res.status(401).json({
      message: "user type not specified"
    });
  }
});

router.get("/savedListings/:token", (req, res) => {
  const user = jwt.decode(req.params.token);
  console.log(user);
  if (user.isClientUser) {
    Listings.getSavedListings(user.id, res);
  } else if (user.isProfessionalUser) {
    Listings.getSavedListings_professional(user.id, res);
  } else if (user.isAdminUser) {
    Listings.getSavedListings_admin(user.id, res);
  } else {
    res.status(401).json({
      err: "User status not provided"
    });
  }
});

router.delete("/savedListings/delete/:listingId/:token", (req, res) => {
  const listingId = req.params.listingId;
  const user = jwt.decode(req.params.token);
  if (user.isClientUser) {
    Listings.deleteSavedListing(listingId, user.id, res);
  } else if (user.isProfessionalUser) {
    Listings.deleteSavedListing_professional(listingId, user.id, res);
  } else if (user.isAdminUser) {
    Listings.deleteSavedListing_admin(listingId, user.id, res);
  } else {
    res.status(401).json({
      err: "User status not provided"
    });
  }
});

router.get('/updateCity', async (req, res) => {
  let resp = await Listings.addCityState(); 
  res.status(200).json(resp)
})

module.exports = router;
