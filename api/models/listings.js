const knex = require("../config/knex/knex");

const NodeGeocoder = require("node-geocoder");
const GeoCode = require("../geocoding");

const options = {
  provider: "google",

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const fs = require("fs");
const csv = require("csv-parser");

const keys = require("../config/env-config");
const distance = require("google-distance-matrix");
distance.key(keys.googleDevKey);

const geocoder = NodeGeocoder(options);

const stateAbbreviations = [
  "AL",
  "AK",
  "AS",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FM",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MH",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PW",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];
const states = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Federated States of Micronesia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Marshall Islands",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Palau",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virgin Island",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

const statesAnd =[
  {
      "name": "Alabama",
      "abbreviation": "AL"
  },
  {
      "name": "Alaska",
      "abbreviation": "AK"
  },
  {
      "name": "American Samoa",
      "abbreviation": "AS"
  },
  {
      "name": "Arizona",
      "abbreviation": "AZ"
  },
  {
      "name": "Arkansas",
      "abbreviation": "AR"
  },
  {
      "name": "California",
      "abbreviation": "CA"
  },
  {
      "name": "Colorado",
      "abbreviation": "CO"
  },
  {
      "name": "Connecticut",
      "abbreviation": "CT"
  },
  {
      "name": "Delaware",
      "abbreviation": "DE"
  },
  {
      "name": "District Of Columbia",
      "abbreviation": "DC"
  },
  {
      "name": "Federated States Of Micronesia",
      "abbreviation": "FM"
  },
  {
      "name": "Florida",
      "abbreviation": "FL"
  },
  {
      "name": "Georgia",
      "abbreviation": "GA"
  },
  {
      "name": "Guam",
      "abbreviation": "GU"
  },
  {
      "name": "Hawaii",
      "abbreviation": "HI"
  },
  {
      "name": "Idaho",
      "abbreviation": "ID"
  },
  {
      "name": "Illinois",
      "abbreviation": "IL"
  },
  {
      "name": "Indiana",
      "abbreviation": "IN"
  },
  {
      "name": "Iowa",
      "abbreviation": "IA"
  },
  {
      "name": "Kansas",
      "abbreviation": "KS"
  },
  {
      "name": "Kentucky",
      "abbreviation": "KY"
  },
  {
      "name": "Louisiana",
      "abbreviation": "LA"
  },
  {
      "name": "Maine",
      "abbreviation": "ME"
  },
  {
      "name": "Marshall Islands",
      "abbreviation": "MH"
  },
  {
      "name": "Maryland",
      "abbreviation": "MD"
  },
  {
      "name": "Massachusetts",
      "abbreviation": "MA"
  },
  {
      "name": "Michigan",
      "abbreviation": "MI"
  },
  {
      "name": "Minnesota",
      "abbreviation": "MN"
  },
  {
      "name": "Mississippi",
      "abbreviation": "MS"
  },
  {
      "name": "Missouri",
      "abbreviation": "MO"
  },
  {
      "name": "Montana",
      "abbreviation": "MT"
  },
  {
      "name": "Nebraska",
      "abbreviation": "NE"
  },
  {
      "name": "Nevada",
      "abbreviation": "NV"
  },
  {
      "name": "New Hampshire",
      "abbreviation": "NH"
  },
  {
      "name": "New Jersey",
      "abbreviation": "NJ"
  },
  {
      "name": "New Mexico",
      "abbreviation": "NM"
  },
  {
      "name": "New York",
      "abbreviation": "NY"
  },
  {
      "name": "North Carolina",
      "abbreviation": "NC"
  },
  {
      "name": "North Dakota",
      "abbreviation": "ND"
  },
  {
      "name": "Northern Mariana Islands",
      "abbreviation": "MP"
  },
  {
      "name": "Ohio",
      "abbreviation": "OH"
  },
  {
      "name": "Oklahoma",
      "abbreviation": "OK"
  },
  {
      "name": "Oregon",
      "abbreviation": "OR"
  },
  {
      "name": "Palau",
      "abbreviation": "PW"
  },
  {
      "name": "Pennsylvania",
      "abbreviation": "PA"
  },
  {
      "name": "Puerto Rico",
      "abbreviation": "PR"
  },
  {
      "name": "Rhode Island",
      "abbreviation": "RI"
  },
  {
      "name": "South Carolina",
      "abbreviation": "SC"
  },
  {
      "name": "South Dakota",
      "abbreviation": "SD"
  },
  {
      "name": "Tennessee",
      "abbreviation": "TN"
  },
  {
      "name": "Texas",
      "abbreviation": "TX"
  },
  {
      "name": "Utah",
      "abbreviation": "UT"
  },
  {
      "name": "Vermont",
      "abbreviation": "VT"
  },
  {
      "name": "Virgin Islands",
      "abbreviation": "VI"
  },
  {
      "name": "Virginia",
      "abbreviation": "VA"
  },
  {
      "name": "Washington",
      "abbreviation": "WA"
  },
  {
      "name": "West Virginia",
      "abbreviation": "WV"
  },
  {
      "name": "Wisconsin",
      "abbreviation": "WI"
  },
  {
      "name": "Wyoming",
      "abbreviation": "WY"
  }
]

uniqueArray = a => [...new Set(a.map(item => item.business_title))];

const Listings = {
  getListings(userInfo) {
    console.log(userInfo);
    return knex("listings")
      .select()
      .where("professional_id", userInfo.id)
      .catch(err => console.log(err));
  },
  async addToListings_Pending(listing) {
    console.log(listing);
    let insert = new Promise((resolve, reject) => {
      knex("listings")
        .insert(listing)
        .then(resp => {
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
        });
    });
    insert.then(resp => {
      knex("pending_listings")
        .delete()
        .where("id", listing.id)
        .then(response => {
          return response;
        });
    });
  },
  async addToListings_Inactive(listing) {
    console.log(listing);
    knex("listings")
      .insert(listing)
      .then(resp => {
        console.log(resp);
      })
      .catch(err => {
        console.log(err);
      });
  },
  async addToPending(listing) {
    console.log(listing);
    geocoder
      .geocode(
        `${listing.street_address}, ${listing.city} ${listing.state}, ${listing.zip}`
      )
      .then(response => {
        console.log(response);
        listing.lat = response[0].latitude;
        listing.lng = response[0].longitude;
        listing.email = listing.email.toLowerCase();
        listing.city = listing.city.toLowerCase();
        return knex("pending_listings")
          .insert(listing)
          .then(resp => {
            console.log(resp);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  },
  addToInactive(listing) {
    knex("inactive_listings")
      .insert(listing)
      .then(response => {
        console.log(response);
        return response;
      })
      .catch(err => {
        console.log(err);
      });
  },
  updateListing(listing, id) {
    if (listing.street_address || listing.city) {
      geocoder
        .geocode(
          `${listing.street_address}, ${listing.city} ${listing.state ||
            ""}, ${listing.zip || ""}`
        )
        .then(response => {
          listing.lat = response[0].latitude;
          listing.lng = response[0].longitude;
          console.log("========update listing =========");
          console.log(listing);
          return knex("listings")
            .update(listing)
            .where("id", id)
            .then(resp => {
              console.log(resp);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      knex("listings")
        .update(listing)
        .where("id", id)
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  async getByCategory__search(category, currentLocation) {
    let catSplit = category.split(",");
    const listings = await knex("listings")
      .select()
      .whereRaw(`LOWER(category) LIKE ?`, [`%${catSplit[0].toLowerCase()}%`])
      .limit(50)
      .then(response => {
        return response;
      })
      .catch(err => {
        console.log(err);
      });
    return Promise.all(
      await listings.map((listing, index) => {
        return new Promise(async (resolve, reject) => {
          await GeoCode.findDistance(
            { lat: listing.lat, lng: listing.lng },
            currentLocation
          )
            .then(distance => {
              console.log(distance);
              if (distance < 160) resolve(listing);
              else reject(new Error());
            })
            .catch(err => console.log(err));
        });
      })
    );
  },
  async getByCategory__single(category, currentLocation) {
    console.log(category.toLowerCase());
    const listings = await knex("listings")
      .select()
      .whereRaw(`LOWER(category) LIKE ?`, [`%${category.toLowerCase()}%`])
      .then(response => {
        console.log(response.length);
        return response;
      })
      .catch(err => {
        console.log(err);
      });
    return listings.map((listing, index) => {
      return new Promise(async (resolve, reject) => {
        let distance = await GeoCode.findDistance2(
          { lat: listing.lat, lng: listing.lng, city: listing.city },
          currentLocation
        );
        if (distance && distance.value < 160934) {
          console.log("LESS");
          resolve(listing);
        } else {
          console.log("GREATER");
          resolve(0);
        }
      });
    });
  },
  getByTitle(title) {
    return knex("listings")
      .select()
      .whereRaw(`LOWER(business_title) like ${title}%`)
      .limit(100)
      .then(response => {
        return response;
      })
      .catch(err => {
        console.log(err);
      });
  },
  async getBySearch(title, currentLocation) {
    const listings = await knex("listings")
      .select()
      .whereRaw(`LOWER(business_title) LIKE ? `, [`%${title.toLowerCase()}%`])
      .then(async response => {
        return uniqueArray(response);
      })
      .catch(err => {
        console.log(err);
      });
    return listings.map((listing, index) => {
      return new Promise(async (resolve, reject) => {
        let distance = await GeoCode.findDistance2(
          { lat: listing.lat, lng: listing.lng, city: listing.city },
          currentLocation
        );
        if (distance && distance.value < 16093400) {
          console.log("LESS");
          resolve(listing);
        } else {
          console.log("GREATER");
          resolve(0);
        }
      });
    });
  },
  getById(id, cb) {
    return knex("listings")
      .select()
      .where("id", id)
      .then(resp => {
        cb.status(200).json(resp);
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json({ message: "listing does not exist" });
      });
  },
  saveListing(listingId, userId, cb) {
    return knex("saved_listings")
      .insert({
        listing_id: listingId,
        user_id: userId
      })
      .then(response => {
        return cb.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
        cb.status(401).json({ err });
      });
  },
  getSavedListings(userId, cb) {
    let promise = new Promise((resolve, reject) => {
      return knex("saved_listings")
        .select("listing_id")
        .where("user_id", userId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json({ err });
        });
    });
    promise
      .then(response => {
        console.log(response);
        const listings = [];
        response.forEach(listing => {
          listings.push(listing.listing_id);
        });
        knex("listings")
          .select()
          .whereIn("id", listings)
          .then(resp => {
            return cb.status(200).json(resp);
          })
          .catch(err => {
            cb.status(401).json(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  },
  deleteSavedListing(listingId, userId, cb) {
    if (cb) {
      return knex("saved_listings")
        .delete()
        .where({
          user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          cb.status(200).json(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json(err);
        });
    } else {
      return knex("saved_listings")
        .delete()
        .where({
          user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  },
  deleteSavedListing_professional(listingId, userId, cb) {
    if (cb) {
      return knex("saved_professional_listings")
        .delete()
        .where({
          professional_user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          cb.status(200).json(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json(err);
        });
    } else {
      return knex("saved_professional_listings")
        .delete()
        .where({
          professional_user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  },
  getSavedListings_professional(userId, cb) {
    let promise = new Promise((resolve, reject) => {
      return knex("saved_professional_listings")
        .select("listing_id")
        .where("professional_user_id", userId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json({ err });
        });
    });
    promise
      .then(response => {
        console.log(response);
        const listings = [];
        response.forEach(listing => {
          listings.push(listing.listing_id);
        });
        knex("listings")
          .select()
          .whereIn("id", listings)
          .then(resp => {
            return cb.status(200).json(resp);
          })
          .catch(err => {
            cb.status(401).json(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  },
  saveListing_professional(listingId, userId, cb) {
    if (cb) {
      return knex("saved_professional_listings")
        .insert({
          listing_id: listingId,
          professional_user_id: userId
        })
        .then(response => {
          cb.status(200).json(response);
        })
        .catch(err => {
          cb.status(401).json({ err });
        });
    } else {
      return knex("saved_professional_listings")
        .insert({
          listing_id: listingId,
          professional_user_id: userId
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  },
  deleteSavedListing_admin(listingId, userId, cb) {
    if (cb) {
      return knex("saved_admin_listings")
        .delete()
        .where({
          admin_user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          cb.status(200).json(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json(err);
        });
    } else {
      return knex("saved_admin_listings")
        .delete()
        .where({
          admin_user_id: userId,
          listing_id: listingId
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  },
  saveListing_admin(listingId, userId, cb) {
    if (cb) {
      return knex("saved_admin_listings")
        .insert({
          listing_id: listingId,
          admin_user_id: userId
        })
        .then(response => {
          cb.status(200).json(response);
        })
        .catch(err => {
          cb.status(401).json({ err });
        });
    } else {
      return knex("saved_admin_listings")
        .insert({
          listing_id: listingId,
          admin_user_id: userId
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.log(err);
          return err;
        });
    }
  },
  getSavedListings_admin(userId, cb) {
    let promise = new Promise((resolve, reject) => {
      return knex("saved_admin_listings")
        .select("listing_id")
        .where("admin_user_id", userId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          console.log(err);
          cb.status(401).json({ err });
        });
    });
    promise
      .then(response => {
        console.log(response);
        const listings = [];
        response.forEach(listing => {
          listings.push(listing.listing_id);
        });
        knex("listings")
          .select()
          .whereIn("id", listings)
          .then(resp => {
            return cb.status(200).json(resp);
          })
          .catch(err => {
            cb.status(401).json(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  },
  getPendingListings(cb) {
    return knex("pending_listings")
      .select("*")
      .then(response => {
        cb.status(200).json(response);
      })
      .catch(err => console.log(err));
  },
  verifyListing(listingId, cb) {
    let select = new Promise((resolve, reject) => {
      knex("pending_listings")
        .select()
        .where("id", listingId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
    select
      .then(listing => {
        console.log(listing);
        verifiedListing = listing[0];

        cb.status(200).json(this.addToListings_Pending(verifiedListing));
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json(err);
      });
  },
  getPendingListing(listingId, cb) {
    knex("pending_listings")
      .select()
      .where("id", listingId)
      .then(response => {
        cb.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json(err);
      });
  },
  async getAllListings__admin(res) {
    return camelizeKeys(
      await knex
        .select(
          "u.id",
          "u.first_name",
          "u.last_name",
          "u.username",
          "u.image_url",
          "u.is_admin",
          "u.phone",
          "u.info",
          "la.email",
          "cu.customer_id",
          "cu.department_id"
        )
        .from("user AS u")
        .leftJoin("local_auth AS la", "la.user_id", "u.id")
        .leftJoin("customer_user AS cu", "cu.user_id", "u.id")
        .where("u.id", "=", id)
        .first()
    );
  },
  // used to update city in db
  addCityState() {
    let results = [];
    fs.createReadStream("api/models/pg_cities_import.csv")
      .on("error", err => {
        if (err) throw err;
      })
      .pipe(csv())
      .on("data", row => {
        return results.push(row);
      })
      .on("end", async () => {
        results.forEach(result => {
          knex("listings")
            .update("city", result.city)
            .where("id", result.id)
            .then(() => {
              console.log("changed");
            })
            .catch(err => {
              console.log(err);
            });
        });
      });
  },
  async addState() {
    let options = await knex("listings")
      .select("id", "full_address", "city", "state")
      .whereNotNull("state")
      .then(resp => {
        console.log(resp);
        return resp.map(item => {
          let split = item.state.split(" ");
          return {
            stateSplit: [...split],
            id: item.id
          };
        });
      })
      .catch(err => {
        console.log(err);
      });
    console.log(options);
    const statesArr = [];
    await options.forEach(listing => {
      listing.stateSplit.forEach(value => {
        if (stateAbbreviations.some(arrVal => value.trim() === arrVal)) {
          statesArr.push({ id: listing.id, state: value });
        } else if (states.some(arrVal => value.trim() === arrVal)) {
          let getAb = statesAnd.findIndex(ab => ab.name === value)
          statesArr.push({ id: listing.id, state: statesAnd[getAb].abbreviation })
        }
      });
    });
    console.log(statesArr);
    statesArr.forEach(listing => {
      knex('listings')
        .update({ state: listing.state })
        .where('id', listing.id)
        .then(resp => {
          console.log('updated')
        }).catch(err => {
          console.error(err)
        })
    })
    
    // const filtered = await options.map(x => {
    //   if (Number(x.last)) {
    //     return { zip: x.last, id: x.id};
    //   } else if (Number(x.secondTo)) {
    //     return { zip: x.secondTo, id: x.id};
    //   } else {
    //     return;
    //   }
    // });
    // console.log(filtered)
    // let filtered__null = await filtered.filter(state => state !== undefined);
    // console.log(filtered__null)
    // filtered__null.forEach(async result => {
    //   await knex("listings")
    //     .update("zip",result.zip)
    //     .where("id", result.id)
    //     .then(() => {
    //       console.log("changed");
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // });
  }
};

module.exports = Listings;
