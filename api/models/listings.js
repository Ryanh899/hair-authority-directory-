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

const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo"
});

var distance = require("google-distance");
distance.apiKey = "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo";

const geocoder = NodeGeocoder(options);

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
    return new Promise((resolve, reject) => {
      let invalidListings = [];
      let validListings = [];
      listings.forEach(async (listing, index) => {
        GeoCode.findDistance(listing, currentLocation)
          .then(km => {
            console.log(km);
            if (km < 10000) {
              console.log("less");
              validListings.push(listing);
            } else if (index + 1 === listings.length) {
              console.log("RESOLVED");
              resolve(validListings);
            } else {
              console.log("INVALID");
              invalidListings.push(listing);
            }
          })
          .then(
            setTimeout(() => {
              console.log("___CATEGORY Single_________");
              console.log(validListings.length);
              resolve(validListings);
            }, 3000)
          )
          .catch(err => {
            console.error(err);
          });
      });
    }).catch(err => {
      console.log(err);
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
  async getBySearch(title, currentLocation, city) {
    const listings = await knex("listings")
      .select()
      .whereRaw(`LOWER(business_title) LIKE ? `, [`%${title.toLowerCase()}%`])
      .then(async response => {
        return uniqueArray(response);
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
              else reject(new Error('greater'));
            })
            .catch(err => console.log(err));
        }).catch(err => console.error(err))
      })
    );
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
  }
};

module.exports = Listings;
