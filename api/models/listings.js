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
      .whereRaw(`LOWER(category) LIKE ? and LOWER(state) = ? or ?`, [
        `%${catSplit[0].toLowerCase()}%`,
        currentLocation.state,
        null
      ])
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
      .limit(50)
      .whereRaw(`LOWER(category) LIKE ? and LOWER(state) = ? or ?`, [
        `%${category.toLowerCase()}%`,
        currentLocation.state.toLowerCase(),
        null
      ])
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
        if (distance && distance.value < 1609340) {
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
      .whereRaw(`LOWER(business_title) like ${title.toLowerCase()}%`)
      .limit(100)
      .then(response => {
        return response;
      })
      .catch(err => {
        console.log(err);
      });
  },
  getByTitle__promise(listingInfo) {
    return knex("listings")
            .select()
            .whereRaw(`LOWER(business_title) like ?`, [`${listingInfo.title.toLowerCase()}%`])
            .then(resp => {
              return resp
            })
            .catch(err => {
              console.log(err)
            })
  },
  getAllByTitle__promise(listingInfo) {
    const results = []; 
    return knex("pending_listings")
            .select()
            .whereRaw(`LOWER(business_title) like ?`, [`${listingInfo.title.toLowerCase()}%`])
            .then(resp => {
              console.log(resp)
              resp.forEach(listing => results.push(listing))
              return knex('listings').select().whereRaw(`LOWER(business_title) like ?`, [`${listingInfo.title.toLowerCase()}%`])
            })
            .then(response => {
              console.log(response)
              response.forEach(listing => results.push(listing))
              return results
            })
            .catch(err => {
              console.log(err)
            })
  },
  async getBySearch(title, currentLocation) {
    const listings = await knex("listings")
      .select()
      .limit(50)
      .whereRaw(`LOWER(business_title) LIKE ? and LOWER(state) = ?`, [
        `%${title.toLowerCase()}%`,
        currentLocation.state.toLowerCase()
      ])
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
  async getByLogo(tagline, currentLocation) {
    const listings = await knex("listings")
      .select()
      .whereRaw(`LOWER(tagline) LIKE ? and LOWER(state) = ?`, [
        `%${tagline.toLowerCase()}%`,
        currentLocation.state.toLowerCase()
      ])
      .then(async response => {
        console.log(tagline)
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
    let getListing = new Promise((resolve, reject) => {
      return knex("listings")
        .select()
        .where("id", id)
        .then(resp => {
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
          cb.status(400).json({ message: "listing does not exist" });
        });
    });
    getListing
      .then(listing => {
        listing = listing[0];
        knex("images")
          .select()
          .where("listing_id", listing.id)
          .then(response => {
            listing.images = response;
            return knex("social_media")
              .select()
              .where("listing_id", listing.id);
          })
          .then(social => {
            console.log(social);
            let sm = social;
            sm.forEach(platform => {
              listing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
            console.log(hours);
            hours.forEach(day => {
              listing[day.day] = {
                opening_hours: day.opening_hours,
                closing_hours: day.closing_hours
              };
            });
            return knex("faq")
              .select()
              .where("listing_id", listing.id);
          })
          .then(faqs => {
            console.log(faqs);
            if (faqs.length > 0) {
              listing.faqs = faqs;
            }
            return cb.json(listing);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.error(err);
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
  storeImage(imageInfo) {
    return knex("images").returning(['image_id', 'image_path', 'listing_id']).insert(imageInfo);
  },
  storeImage__featured(imageInfo) {
    return knex("pending_listings")
      .update("feature_image", imageInfo.image_path)
      .where("id", imageInfo.listing_id);
  },
  stageListing(listingInfo) {
    return knex("pending_listings")
            .returning("id")
            .insert({ business_title: listingInfo.title, professional_id: listingInfo.user.id })
            .then(resp => {
              console.log(resp)
              return knex('subscriptions').update('listing_id', resp[0]).where('subscription_id', listingInfo.subscription_id).returning('listing_id')
            })
  },
  updateStagedListing(listingInfo) {
    return knex("pending_listings")
      .update(listingInfo)
      .where("id", listingInfo.id);
  },
  updateStagedListing__table(table, data) {
    return knex(table).insert(data);
  },
  removeImage(imageId) {
    return knex('images').delete('*').where('image_id', imageId).returning(['image_id', 'image_path', 'listing_id'])
  }, 
  removeImage__feature(listingId) {
    return knex('pending_listings').update('feature_image', 'null').where('id', listingId)
  },
  addPendingClaim (claimInfo) {
    return knex('pending_claims').insert(claimInfo).then(response => response).catch(err => err)
  },
  getListingTitle__id (id) {
    return knex('listings').select('business_title').where({ id: id, claimed: false }).then(response => response[0].business_title).catch(err => false)
  }, 
  // used to update city in db
  addCityState() {
    let results = [];
    fs.createReadStream("api/models/pg_all_taglines_import.csv")
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
            .update('tagline', result.tagline)
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
