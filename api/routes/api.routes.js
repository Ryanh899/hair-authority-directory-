const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");

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
  Listings.findOne(listing, res);
});

router.put("/updateListing/:id", (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  const listing = req.body;
  console.log(listing);
  Listings.updateListing(listing, id);
});

router.put("/updateProfile", async (req, res) => {
  const updateInfo = req.body;
  console.log(updateInfo);
  User.updateProfessionalInfo(updateInfo, res)
});

router.get('/search/category/:category', async (req, res) => {
    const category = req.params.category
    Listings.getByCategory(category)
        .then(resp => {
            res.status(200).json(resp)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json( err )
        })
})

router.get('/search/:query/:location', (req, res) => {
    const query = req.params.query
    const location = req.params.location.split('+')
    console.log(location)
    const searchResults = []; 
    Listings.getByTitle(query)
        .then(response => {
            response.forEach(listing => {
                searchResults.push(listing)
            })
            if (response.length !== 0) {
                Listings.getByCategory(response[0].category)
                .then(resp => {
                    resp.forEach(listing => {
                        if (listing.business_title !== response[0].business_title)
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
