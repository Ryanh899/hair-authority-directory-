const knex = require("../config/knex/knex");

const NodeGeocoder = require("node-geocoder");
const GeoCode = require("../geocoding");
const User = require('./user');
const Uuid = require('uuid');
const Zoho = require('../models/zoho')

const options = {
  provider: "google",

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const fs = require("fs");
const csv = require("csv-parser");

const uuidParse = require('uuid-parse');

const keys = require("../config/env-config");
const distance = require("google-distance-matrix");
distance.key(keys.googleDevKey);

const geocoder = NodeGeocoder(options);

const moment = require("moment");
moment().format();

uniqueArray = a => [...new Set(a.map(item => item.business_title))];

const Listings = {
  getListings(userInfo) {
    console.log(userInfo);
    return knex("listings")
      .select()
      .where("professional_id", userInfo.id)
      .catch(err => console.log(err));
  },
  get100Listings(res) {
    return knex('listings')
        .select('*')
        .limit(100)
        .then(response => {
          res.json(response); 
        })
        .catch(err => {
          res.json(err)
        })
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
    })
    .catch(err => {
      console.error(err)
      return err
    })
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
        listing.full_address = `${listing.street_address}, ${listing.city} ${listing.state}, ${listing.zip}`;
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
      .insert(listing.listing)
      .then(response => {
        console.log(response);
        return knex('listings').del().where('id', listing.listingId)
      })
      .then(resp => {
        return resp
      })
      .catch(err => {
        console.log(err);
      });
  },
  async makeInactive (subscription_id, user_id, listing_id) {
    const terminateSubscription = await Zoho.terminateSubscription(subscription_id)


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
  async getByCategory__single(category, currentLocation, distance) {
    console.log(category.toLowerCase());
    const miles = Number(distance); 
    let state; 
    miles <= 160934 ? state = currentLocation.state.toLowerCase() : state = '%'
    let limit; 
    state !== '%' ? limit = 100 : limit = 100; 
    const listings = await knex("listings")
      .select()
      .limit(limit)
      .whereRaw(`LOWER(category) LIKE ? and LOWER(state) like ?`, [
        `%${category.toLowerCase()}%`,
        state
      ])
      .then(response => {
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
        if (distance && distance.value < miles) {
          resolve(listing);
        } else {
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
  async getBySearch(title, currentLocation, distance) {
    const miles = Number(distance); 
    let state; 
    miles <= 160934 ? state = currentLocation.state.toLowerCase() : state = '%'
    let limit; 
    state !== '%' ? limit = 100 : limit = 100; 
    const listings = await knex("listings")
      .select()
      .limit(limit)
      .whereRaw(`LOWER(business_title) LIKE ? and LOWER(state) like ?`, [
        `%${title.toLowerCase()}%`,
        state
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
        if (distance && distance.value < miles) {
          resolve(listing);
        } else {
          resolve(0);
        }
      });
    });
  },
  async getBySearch__admin(title) {
    return knex("listings")
      .select()
      .whereRaw(`LOWER(business_title) LIKE ?;`, [
        `%${title.toLowerCase()}%`
      ])
      .then(async response => {
        return response; 
      })
      .catch(err => {
        console.log(err);
      });
  },
  async getPendingBySearch__admin(title) {
    return knex("pending_listings")
      .select()
      .whereRaw(`LOWER(business_title) LIKE ?;`, [
        `%${title.toLowerCase()}%`
      ])
      .limit(150)
      .then(async response => {
        return response; 
      })
      .catch(err => {
        console.log(err);
      });
  },
  async getByLogo(tagline, currentLocation, distance) {
    const miles = Number(distance); 
    let state; 
    miles <= 160934 ? state = currentLocation.state.toLowerCase() : state = '%'; 
    const listings = await knex("listings")
      .select()
      .limit(100)
      .whereRaw(`LOWER(tagline) LIKE ? and LOWER(state) LIKE ?`, [
        `%${tagline.toLowerCase()}%`,
        state
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
        if (distance && distance.value < miles) {
          resolve(listing);
        } else {
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
            let sm = social;
            sm.forEach(platform => {
              listing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
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
            if (faqs.length > 0) {
              listing.faqs = faqs;
            }
            return knex("subscriptions")
              .select()
              .where("listing_id", listing.id);
          })
          .then(subscription => {
            if (subscription.length) {
              listing.plan = subscription[0].plan_code; 
              listing.status = subscription[0].status; 
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
  getById__pending(id, cb) {
    return new Promise((resolve, reject) => {
      knex("pending_listings")
        .select()
        .where("id", id)
        .then(resp => {
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
          cb.status(400).json({ message: "listing does not exist" });
        });
    })
    .then(async listing => {
        listing = listing[0]
        const thisListing = listing; 
        return knex("images")
          .select()
          .where("listing_id", listing.id)
          .then(response => {
            thisListing.images = response;
            return knex("social_media")
              .select()
              .where("listing_id", listing.id);
          })
          .then(social => {
            let sm = social;
            sm.forEach(platform => {
              thisListing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
            hours.forEach(day => {
              thisListing[day.day] = {
                opening_hours: day.opening_hours,
                closing_hours: day.closing_hours
              };
            });
            return knex("faq")
              .select()
              .where("listing_id", listing.id);
          })
          .then(faqs => {
            if (faqs.length > 0) {
              thisListing.faqs = faqs;
            }
            console.log(thisListing)
            return thisListing
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  },
  getById__admin(id, cb) {
    return new Promise((resolve, reject) => {
      knex("listings")
        .select()
        .where("id", id)
        .then(resp => {
          console.log('first promise')
          console.log(resp)
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
          cb.status(400).json({ message: "listing does not exist" });
        });
    })
    .then(async listing => {
        listing = listing[0]
        const thisListing = listing; 
        console.log(thisListing); 
        console.log('response from promise')
        return knex("images")
          .select()
          .where("listing_id", listing.id)
          .then(response => {
            thisListing.images = response;
            return knex("social_media")
              .select()
              .where("listing_id", listing.id);
          })
          .then(social => {
            // console.log(social);
            let sm = social;
            sm.forEach(platform => {
              thisListing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
            // console.log(hours);
            hours.forEach(day => {
              thisListing[day.day] = {
                opening_hours: day.opening_hours,
                closing_hours: day.closing_hours
              };
            });
            return knex("faq")
              .select()
              .where("listing_id", listing.id);
          })
          .then(faqs => {
            // console.log(faqs);
            if (faqs.length > 0) {
              thisListing.faqs = faqs;
            }
            console.log(thisListing)
            return thisListing
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  },
  getInactiveById__admin(id, cb) {
    return new Promise((resolve, reject) => {
      knex("inactive_listings")
        .select()
        .where("id", id)
        .then(resp => {
          console.log('first promise')
          console.log(resp)
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
          cb.status(400).json({ message: "listing does not exist" });
        });
    })
    .then(async listing => {
        listing = listing[0]
        const thisListing = listing; 
        console.log(thisListing); 
        console.log('response from promise')
        return knex("images")
          .select()
          .where("listing_id", listing.id)
          .then(response => {
            thisListing.images = response;
            return knex("social_media")
              .select()
              .where("listing_id", listing.id);
          })
          .then(social => {
            // console.log(social);
            let sm = social;
            sm.forEach(platform => {
              thisListing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
            // console.log(hours);
            hours.forEach(day => {
              thisListing[day.day] = {
                opening_hours: day.opening_hours,
                closing_hours: day.closing_hours
              };
            });
            return knex("faq")
              .select()
              .where("listing_id", listing.id);
          })
          .then(faqs => {
            // console.log(faqs);
            if (faqs.length > 0) {
              thisListing.faqs = faqs;
            }
            console.log(thisListing)
            return thisListing
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
  getPendingListings__recent(res) {
    const lastMonth = moment().subtract(45, "days").format("YYYY-MM-DD[T]HH:mm:ss");
    console.log(lastMonth); 
    let listings = []; 
    return knex("pending_listings")
      .select("*")
      .where('date_published', '>', lastMonth)
      .limit(100)
      .then(response => {
        const ids = response.map(listing => {
          const bytes = uuidParse.parse(listing.id); 
          const string = uuidParse.unparse(bytes); 
          return string
        }); 
        response.forEach(listing => {
          listings.push(listing)
        })
        console.log(ids)
        return knex('subscriptions').select().whereIn('listing_id', ids)
      }).then(async response => {
        console.log(response)
          const subs = response.map(x => x.listing_id)
          console.log(subs)
          const newListings = await listings.map(listing => {
              if (subs.includes(listing.id)) {
                const subsIndex = subs.indexOf(listing.id); 
                console.log(`sub index: ${subsIndex}`)
                const listingIndex = listings.map(n => n.id).indexOf(listing.id)
                console.log(`listing index: ${listingIndex}`)
                listing.subscription = response[subsIndex]
                return listing;
              } else {
                return listing
              }
          });
        res.json(newListings) 
      })
      .catch(err => {
        res.json(err)
        console.log(err)
      })
  },
  getInactiveListings(res) {
    const lastMonth = moment().subtract(30, "days").format("YYYY-MM-DD[T]HH:mm:ss");
    console.log(lastMonth)
    let listings = []; 
    return knex("inactive_listings")
      .select("*")
      .where('date_published', '>', lastMonth)
      .limit(100)
      .then(response => {
        const ids = response.map(listing => {
          const bytes = uuidParse.parse(listing.id); 
          const string = uuidParse.unparse(bytes); 
          return string
        }); 
        response.forEach(listing => {
          listings.push(listing)
        })
        console.log(ids)
        return knex('subscriptions').select().whereIn('listing_id', ids)
      }).then(async response => {
        console.log(response)
          const subs = response.map(x => x.listing_id)
          console.log(subs)
          const newListings = await listings.map(listing => {
              if (subs.includes(listing.id)) {
                const subsIndex = subs.indexOf(listing.id); 
                console.log(`sub index: ${subsIndex}`)
                const listingIndex = listings.map(n => n.id).indexOf(listing.id)
                console.log(`listing index: ${listingIndex}`)
                listing.subscription = response[subsIndex]
                return listing;
              } else {
                return listing
              }
          });
        res.json(newListings) 
      })
      .catch(err => {
        res.json(err)
        console.log(err)
      })
  },
  getPendingListings(cb) {
    return knex("pending_listings")
      .select("*")
      .limit(100)
      .then(response => {
        cb.status(200).json(response);
      })
      .catch(err => console.log(err));
  },
  verifyListing(listingId, professional_id, cb) {
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
        verifiedListing.professional_id = professional_id; 
        verifiedListing.claimed = true; 

        cb.status(200).json(this.addToListings_Pending(verifiedListing));
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json(err);
      });
  },
  verifyClaim(listingId, professional_id, subscription_id, res) {
    let listing;
    let select = new Promise((resolve, reject) => {
      knex("listings")
        .update({
          professional_id: professional_id, 
          claimed: true
        })
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
      .then(resp => {
        listing = resp
        console.log(resp);
        return knex('pending_claims').delete().where('subscription_id', subscription_id)
      })
      .then(response => {
        res.json({ del: response, update: listing })
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },
  // getPendingListing(listingId, cb) {
  //   knex("pending_listings")
  //     .select()
  //     .where("id", listingId)
  //     .then(response => {
  //       cb.status(200).json(response);
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       cb.status(400).json(err);
  //     });
  // },
  async getAllListings__admin(res) {
    let listings = []; 
    return knex('listings')
      .select()
      .limit('100')
      .then(response => {
        const ids = response.map(listing => {
          const bytes = uuidParse.parse(listing.id); 
          const string = uuidParse.unparse(bytes); 
          return string
        }); 
        response.forEach(listing => {
          listings.push(listing)
        })
        console.log(ids)
        return knex('subscriptions').select().whereIn('listing_id', ids)
      }).then(async response => {
        console.log(response)
          const subs = response.map(x => x.listing_id)
          const newListings = await listings.map(listing => {
              if (subs.includes(listing.id)) {
                const subsIndex = subs.indexOf(listing.id); 
                const listingIndex = listings.map(n => n.id).indexOf(listing.id)
                listings[listingIndex].subscription = response[subsIndex]
              } else {
                return listing
              }
          });
        res.json(newListings) 
      })
      .catch(err => {
        res.json(err)
        console.log(err)
      })
  },
  getPendingClaims(res) {
    const lastMonth = moment().subtract(10, "days").format("YYYY-MM-DD[T]HH:mm:ss");
    console.log(lastMonth)
    let listings = []; 
    return knex("pending_claims")
      .select("*")
      .where('date_created', '>', lastMonth)
      .limit(100)
      .then(response => {
        let subs = response.map(x => x.subscription_id)
        console.log(subs)
        return knex('subscriptions').select('*').whereIn('subscription_id', subs).leftJoin('listings', 'subscriptions.listing_id', '=', 'listings.id')
      }).then(resp => {
        console.log(resp)
        res.json(resp)
      })
      .catch(err => {
        res.json(err)
        console.log(err)
      })
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
      .where("id", listingInfo.id)
      .then(response => {
        return response
      })
      .catch(err => {
        console.error(err)
      })
  },
  updateListing(listingInfo) {
    return knex("listings")
      .update(listingInfo)
      .where("id", listingInfo.id)
      .then(response => {
        return response
      })
      .catch(err => {
        console.error(err)
      })
  },
  updateDescription (description) {
    const listingId = description.listing_id; 
    console.log(description)
    return knex('listings')
            .update({ business_description: description.html })
            .where('id', listingId)
            .then(updateHtml => {
              console.log(updateHtml); 
              return knex('quill_deltas').update({ delta: JSON.stringify(description.delta) }).where('listing_id', listingId)
            })
            .then(updateDelta => {
              console.log(`updateDelta: ${updateDelta}`); 
              if ( updateDelta ) {
                return updateDelta
              } else {
                return knex('quill_deltas')
                  .insert({ delta: JSON.stringify(description.delta), listing_id: listingId })
                  .then(insert => {
                    return insert
                  }); 
              }
            })
            .catch(err => {
              console.log(err)
            })
  }, 
  updateDescription__staged (description) {
  const listingId = description.listing_id; 
  console.log(description)
    
  return knex('quill_deltas').update({ delta: JSON.stringify(description.delta) }).where('listing_id', listingId)
    .then(updateDelta => {
      console.log(`updateDelta: ${updateDelta}`); 
      if ( updateDelta ) {
        return updateDelta
      } else {
        return knex('quill_deltas')
          .insert({ delta: JSON.stringify(description.delta), listing_id: listingId })
          .then(insert => {
            return insert
          }); 
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  updateStagedListing__table(table, data) {
    return knex(table).insert(data).where('listing_id', data.id)
      .then(response => {
        return response
      })
      .catch(err => {
        console.log(err)
      })
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
  getClaimById__subscription (subscription_id) {
    console.log(subscription_id)
  return knex('pending_claims')
      .select()
      .where('subscription_id', subscription_id)
      .then(resp => {
        return resp
      })
      .catch(err => {
        console.error(err); 
        return err
      })
  }, 
  getListing__id (listingId) {
  return knex('listings')
          .select('*')
          .where('id', listingId)
          .then(resp => {
            return resp
          })
          .catch(err => {
            console.error(err)
          })
  },
  getById__userId (userId, subscriptions, res) {
    console.log(userId)
    return new Promise((resolve, reject) => {
      knex("listings")
        .select('*')
        .where("professional_id", userId)
        .then(resp => {
          console.log('first promise')
          console.log(resp)
          resolve(resp);
        })
        .catch(err => {
          console.log(err);
          res.status(400).json({ message: "listing does not exist" });
        });
    })
    .then(async listings => {
      let userListings = []; 
      console.log(listings)
      listings.forEach((listing, index) => {
        const thisListing = listing; 
        thisListing.subscription = subscriptions.filter(s => s.listing_id===thisListing.id)[0] 
        console.log(thisListing); 
        console.log('response from promise')
        return knex("images")
          .select()
          .where("listing_id", listing.id)
          .then(response => {
            thisListing.images = response;
            return knex("social_media")
              .select()
              .where("listing_id", listing.id);
          })
          .then(social => {
            // console.log(social);
            let sm = social;
            sm.forEach(platform => {
              thisListing[platform.platform] = platform.url;
            });
            return knex("hours")
              .select()
              .where("listing_id", listing.id);
          })
          .then(hours => {
            // console.log(hours);
            hours.forEach(day => {
              thisListing[day.day] = {
                opening_hours: day.opening_hours,
                closing_hours: day.closing_hours
              };
            });
            return knex("faq")
              .select()
              .where("listing_id", listing.id);
          })
          .then(faqs => {
            // console.log(faqs);
            if (faqs.length > 0) {
              thisListing.faqs = faqs;
            }
            console.log(thisListing)
            return knex('quill_deltas').select().where('listing_id', listing.id); 
          })
          .then(delta => {
            if (delta.length) {
              thisListing.delta = delta[0].delta
            }

            userListings.push(thisListing)
            let length = listings.length
            if (index === length - 1) {

              res.json({ listings: userListings })
            }
          })
          .catch(err => {
            console.log(err);
          });
      })
    })
      .catch(err => {
        console.error(err);
      });
  },
  getDelta__id (listing_id) {
    return knex('quill_deltas')
      .select()
      .where('listing_id', listing_id)
      .then(response => {
        return response 
      })
      .catch(err => {
        console.log(err)
      })
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
  }, 
  updateRefresh () {
    knex('zoho_auth')
        .update('refresh_token', '1000.64704926490f15a58e75adeb02f6a7f4.cef1f6b36c234910192a10596555d94a')
        .where({ id: 356 })
        .then(resp => {
          console.log(resp)
          return res.send(resp)
        })
        .catch(err => {
          console.log(err)
        })
  }
};

module.exports = Listings;
