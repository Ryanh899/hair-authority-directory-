const knex = require('../config/knex/knex'); 

const NodeGeocoder = require('node-geocoder');
const GeoCode = require('../geocoding'); 
 
const options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo'
  });

  var distance = require('google-distance');
distance.apiKey = 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo';
 
const geocoder = NodeGeocoder(options);

const Listings = {
    getListings(userInfo) {
        console.log(userInfo)
        return knex('listings')
            .select()
            .where('professional_id', userInfo.id)
            .catch(err => console.log(err))
    }, 
    async addListing(listing) {
        console.log(listing)
        geocoder.geocode(`${listing.street_address}, ${listing.city} ${listing.state}, ${listing.zip}`)
        .then(response => {
            console.log(response)
            listing.lat = response[0].latitude
            listing.lng = response[0].longitude
            listing.email = listing.email.toLowerCase()
            listing.city = listing.city.toLowerCase(); 
            return knex('listings')
            .insert(listing)
            .then(resp => {
                console.log(resp)
            })
            .catch(err => {
                console.log(err)
            })
        })
        .catch(err => {
            console.log(err)
        })
        
    }, 
    findOne(id, cb) {
        knex('listings')
            .select()
            .where('id', id)
            .then(response => {
                cb.json(response[0])
            })
            .catch(err => {
                console.log(err)
            })
    }, 
    updateListing(listing, id) {
        knex('listings')
            .where('id', id)
            .update(listing)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err)
            })
    }, 
    getByCategory(category){
        return knex('listings')
            .select()
            .where('category', category)
            .limit(25)
            .then(response => {
                return response
            })
            .catch(err => {
                console.log(err)
            })
    }, 
    getByTitle(title) {
        return knex('listings')
        .select()
        .where('business_title', 'like', `${title}%`)
        .then(response => {
            return response
        })
        .catch(err => {
            console.log(err)
        })
    }, 
    getBySearch(title, currentLocation) {
        return knex('listings')
        .select()
        .where('business_title', 'like', `${title}%`)
        .then(response => {
            console.log(response)
            response.forEach(listing => {
                haversineDistance([listing.lng, listing.lat], [Number(currentLocation.lng), Number(currentLocation.lat)], true)
                distance.get(
                    {
                      index: 1,
                    //   origin: `${currentLocation.lat}, ${currentLocation.lng}`,
                    //   destination: `${listing.lat}, ${listing.lng}`
                    origin: '33.457458, -117.605306', 
                    destination: '33.442920, -117.644616', 
                    },
                    function(err, data) {
                      if (err) return console.log(err);
                      console.log(data);
                    });

            })
            return response

        })
        .catch(err => {
            console.log(err)
        })
    }
}
function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  console.log(...arguments)

  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if(isMiles) d /= 1.60934;
  console.log('-------')
  console.log(d)
  return d;
}
module.exports = Listings