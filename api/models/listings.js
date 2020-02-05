const knex = require('../config/knex/knex'); 

const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
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
    }
}

module.exports = Listings