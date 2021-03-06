const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Listings = require("../models/listings");
const User = require("../models/user");
const GeoCode = require("../geocoding");
const NodeGeocoder = require("node-geocoder");
// const Aws = require("../aws");
const AWS = require("aws-sdk");
const moment = require("moment");
const crypto = require("crypto");
const Zoho = require("../models/zoho");

AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("aws connected");
  }
});

AWS.config.update({ region: "us-east-1" });

const s3 = new AWS.S3();

const options = {
  provider: "google",

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: process.env.GOOGLE_DEV_API_KEY, // for Mapquest, OpenCage, Google Premier
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

router.get("/listings", async (req, res) => {
  Listings.get100Listings(res);
});

router.get("/listings/:token", async (req, res) => {
  const user = jwt.decode(req.params.token);
  const listings = Listings.getListings(user);
  listings
    .then(response => {
      res.json(response);
    })
    .catch(err => console.log(err));
});

router.post("/newListing", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const decodedInfo = decoded;
      let listing = req.body.data;
      listing.professional_id = decodedInfo.id;
      if (decodedInfo.isProfessionalUser) {
        Listings.addToPending(listing);
        res.status(200).send("Listing added to pending");
      } else if (decodedInfo.isClientUser) {
        Listings.addToPending(listing);
        res.status(200).send("Listing added to pending");
      }
    }
  );
});

router.get("/user/profile/:token", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const userToken = decoded;
      const user = await User.getProfessionalProfile(userToken);

      res.json(user);
    }
  );
});

router.get("/listing/:id", (req, res) => {
  const listing = req.params.id;
  Listings.getById(listing, res);
});

router.get("/listing/title/:title", async (req, res) => {
  const listing = req.params.title;
  const searchResults = await Listings.getByTitle__promise(listing);

  res.json(searchResults);
});

router.put("/updateListing/:id", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const id = req.params.id;
      const listing = req.body;
      Listings.updateListing(listing, id);
    }
  );
});

router.put("/updateProfile", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const updateInfo = req.body;
      User.updateProfessionalInfo(updateInfo, res);
    }
  );
});

router.get(
  "/search/category/:category/:location/:distance",
  async (req, res) => {
    const category = req.params.category.replace(/\+/g, "/");
    const distance = req.params.distance;
    let location = req.params.location.split("+");
    if (location[0] === null || location[1] === null) {
      res.status(401).json({
        message: "no location given"
      });
    }
    const city = await geocoder
      .reverse({ lat: Number(location[0]), lon: Number(location[1]) })
      .catch(err => console.log(err));
    location = {
      lat: location[0],
      lng: location[1],
      city: city[0].city.toLowerCase(),
      state: city[0].administrativeLevels.level1short
    };
    const searchPromises = await Listings.getByCategory__single(
      category,
      location,
      distance
    );
    Promise.all(searchPromises)
      .then(results => {
        return results;
      })
      .catch(err => {
        console.error(err);
        return results;
      })
      .then(results => {
        const filtered = results.filter(x => x !== 0);
        res.status(200).json(filtered);
      });
  }
);

uniqueArray = a =>
  [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));

router.get("/search/:query/:location/:distance", async (req, res) => {
  const query = req.params.query.toLowerCase();
  const distance = req.params.distance;
  let location = req.params.location.split("+");
  if (location[0] === "null" || location[1] === "null") {
    return res.status(404).json({
      message: "location not found"
    });
  }
  const city = await geocoder
    .reverse({ lat: Number(location[0]), lon: Number(location[1]) })
    .catch(err => console.log(err));
  location = {
    lat: location[0],
    lng: location[1],
    city: city[0].city.toLowerCase(),
    state: city[0].administrativeLevels.level1short
  };
  const searchPromises = await Listings.getBySearch(query, location, distance);
  Promise.all(searchPromises)
    .then(results => {
      return results;
    })
    .catch(err => {
      console.error(err);
      return results;
    })
    .then(results => {
      const filtered = results.filter(x => x !== 0);
      res.status(200).json(filtered);
    });
});

router.get("/search/logo/:query/:location/:distance", async (req, res) => {
  const query = req.params.query.toLowerCase();
  const distance = req.params.distance;
  let location = req.params.location.split("+");
  if (location[0] === "null" || location[1] === "null") {
    return res.status(404).json({
      message: "location not found"
    });
  }
  const city = await geocoder
    .reverse({ lat: Number(location[0]), lon: Number(location[1]) })
    .catch(err => console.log(err));
  location = {
    lat: location[0],
    lng: location[1],
    city: city[0].city.toLowerCase(),
    state: city[0].administrativeLevels.level1short
  };
  const searchPromises = await Listings.getByLogo(query, location, distance);
  Promise.all(searchPromises)
    .then(results => {
      return results;
    })
    .catch(err => {
      console.error(err);
      return results;
    })
    .then(results => {
      const filtered = results.filter(x => x !== 0);
      res.status(200).json(filtered);
    });
});

router.post("/saveListing/:id", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const listingId = req.params.id;
      const user = decoded;
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
    }
  );
});

router.get("/savedListings/:token", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const user = decoded;
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
    }
  );
});

router.delete("/savedListings/delete/:listingId/:token", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const listingId = req.params.listingId;
      const user = decoded;
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
    }
  );
});

router.get("/updateCity", async (req, res) => {
  let resp = await Listings.addCityState();
  res.status(200).json(resp);
});

const policy = {
  expiration: "2020-12-31T12:00:00.000Z",
  conditions: [
    { bucket: "ha-images-02" },
    ["starts-with", "$key", "uploads/2020/"],
    { acl: "public-read" },
    ["starts-with", "$Content-Type", "image/"],
    { "x-amz-meta-uuid": "3ea38cf1-c266-44ca-a309-1844207e77a7" },
    { "x-amz-server-side-encryption": "AES256" },
    ["starts-with", "$x-amz-meta-tag", ""],

    {
      "x-amz-credential":
        "AKIAIB3553V7LVPV5KOQ/20201231/us-west-1/s3/aws4_request"
    },
    { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
    { "x-amz-date": "20201231T000000Z" }
  ]
};
const getRandomFilename = () => crypto.randomBytes(16).toString("hex");

router.get("/s3/sign_put", (req, res) => {
  console.log(req.headers.authorization)
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const contentType = req.query.contentType;
      if (!contentType.startsWith("image/")) {
        throw new Error("must be image/");
      }
      const random = crypto.randomBytes(16).toString("hex");
      // NEED TO DO AUTH HERE
      const userid = req.query.userId; // some kind of auth
      const year = moment().format("YYYY");
      const month = moment().format("M");
      const key = `uploads/${year}/${month}/${userid}-${getRandomFilename()}`;
      const url = s3.getSignedUrl("putObject", {
        Bucket: process.env.BUCKETNAME,
        Key: key, // add a part with the userid!
        ContentType: contentType,
        ACL: "public-read"
        // can not set restrictions to the length of the content
      });
      console.log(`S3 SIGN PUT URL: ${url}`);
      res.json({ url, key });
    }
  );
});

router.get("/s3/sign_post", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const userid = req.body.userId; // some kind of auth

      const data = s3.createPresignedPost({
        Bucket: process.env.BUCKETNAME,
        Fields: {
          key: getRandomFilename() // totally random
        },
        Conditions: [
          ["content-length-range", 0, 1000000], // content length restrictions: 0-1MB
          ["starts-with", "$Content-Type", "image/"], // content type restriction
          ["eq", "$x-amz-meta-userid", userid] // tag with userid <= the user can see this!
        ]
      });

      data.fields["x-amz-meta-userid"] = userid; // Don't forget to add this field too
      res.json(data);
    }
  );
});

router.post("/storeimage", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      Listings.storeImage(req.body)
        .then(resp => {
          console.log(resp);
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.post("/storeimage/delta", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      Listings.storeImage__delta(req.body)
        .then(resp => {
          console.log(resp);
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.post("/storeimage/feature", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      Listings.storeImage__featured(req.body)
        .then(resp => {
          console.log(resp);
          return Listings.storeImage(req.body);
        })
        .then(resp => {
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.delete("/removeimage/:id", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const imageId = req.params.id;
      const removeLocal = new Promise((resolve, reject) => {
        Listings.removeImage(imageId)
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            console.log(err);
          });
      });
      removeLocal
        .then(resp => {
          console.log(resp);
          s3.deleteObject(
            {
              Bucket: process.env.BUCKETNAME,
              Key: resp[0].image_path
            },
            resp => {
              console.log(resp);
              res.json(resp);
            }
          );
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.delete("/removeimage/feature/:id", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const imageId = req.params.id;
      let imageKey = [];
      const removeLocal = new Promise((resolve, reject) => {
        Listings.removeImage(imageId)
          .then(resp => {
            imageKey.push(resp[0].image_path);
            return Listings.removeImage__feature(resp[0].listing_id);
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            console.log(err);
          });
      });
      removeLocal
        .then(resp => {
          console.log(resp);
          s3.deleteObject(
            {
              Bucket: process.env.BUCKETNAME,
              Key: imageKey[0]
            },
            resp => {
              res.json(resp);
            }
          );
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.post("/stagelisting", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const user = decoded;
      const subInfo = {
        title: req.body.business_title,
        subscription_id: req.body.subscription_id,
        customer_id: req.body.customer_id,
        card_id: req.body.card_id,
        user
      };

      const titleCheck = await Listings.getByTitle__promise(subInfo);
      if (!titleCheck.length) {
        Listings.stageListing(subInfo)
          .then(resp => {
            console.log(resp);
            res.json(resp);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        console.log("DONT STAGE");
        res.json({ exists: true, listings: titleCheck });
      }
    }
  );
});

router.put("/stagelisting", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      let data = req.body;
      if (data.specialSkills) {
        Listings.updateSpecialSkills(data.id, data.specialSkills)
        .then(resp => {
          console.log(resp);
          return Listings.updateStagedListing(data)
        })
        .then(resp => {
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
      } else {
        Listings.updateStagedListing(data)
        .then(resp => {
          console.log(resp);
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
      }
    }
  );
});

// router.put('/stagelisting/description', (req, res) => {
//   let data = req.body;
//   console.log(data)
//   Listings.updateDescription(data)
//     .then(resp => {
//       console.log(resp)
//       res.json(resp)
//     })
//     .catch(err => {
//       console.log(err)
//     })
// })

router.put("/updatedescription/staged", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      let description = req.body;
      const insert = await Listings.updateDescription__staged(description);
      if (description.specialSkills) {
        await Listings.updateSpecialSkills(description.listing_id, description.specialSkills); 
      }
      res.json(insert);
    }
  );
});

router.put("/updatedescription", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      let description = req.body;
      const insert = await Listings.updateDescription(description);

      res.json(insert);
    }
  );
});

router.put("/updatelisting", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      let data = req.body;
      Listings.updateListing(data)
        .then(resp => {
          console.log(resp);
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.put("/stagelisting/:table", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const table = req.params.table;
      const data = req.body;

      Listings.updateStagedListing__table(table, data)
        .then(resp => {
          res.json(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

// for forms that have data in multiple tables
router.post("/stagelisting/:table/:form", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      console.log(req.body);
      const table = req.params.table;
      const primaryData = req.body[0];
      const metaData = req.body[1];
      const listing_id = primaryData.id;

      let primaryUpdate = new Promise((resolve, reject) => {
        resolve(Listings.updateStagedListing(primaryData));
      });

      primaryUpdate
        .then(resp => {
          Listings.updateStagedListing__table(table, metaData)
            .then(secondResp => {
              console.log(resp);
              console.log(secondResp);
              res.json(secondResp);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    }
  );
});

router.put("/updatestatus", (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      console.log(req.body);
      res.json({ message: "test" });
    }
  );
});

router.get("/dashboard/listings/:token", async (req, res) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.PRIVATE_KEY,
    async function(err, decoded) {
      if (err) {
        console.log(err.message);
        res.status(404).send(err.message);
        return;
      }
      const user = decoded;
      // get subscription
      const subscriptions = await Zoho.subscriptionCheck__userId(user.id);
      // if subscription exists
      if (subscriptions.length) {
        // get listing info
        const filterSubscriptions = await subscriptions.filter(
          x => x.status !== "cancelled"
        );
        const listings = await Listings.getById__userId(
          user.id,
          filterSubscriptions,
          res
        );
      } else {
        res.status(401).json({ error: "User has no subscription" });
      }
    }
  );
});


router.put("/udateRefresh", (req, res) => {
  Listings.updateRefresh(res);
});

module.exports = router;
