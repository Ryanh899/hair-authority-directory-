const knex = require('../config/knex/knex');

const NodeGeocoder = require('node-geocoder');
const GeoCode = require('../geocoding');

const options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
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
    updateListing(listing, id) {
        if (listing.street_address || listing.city) {
            geocoder.geocode(`${listing.street_address}, ${listing.city} ${listing.state || ''}, ${listing.zip || ''}`)
            .then(response => {
                listing.lat = response[0].latitude
                listing.lng = response[0].longitude
                console.log('========update listing =========')
                console.log(listing)
                return knex('listings')
                    .update(listing)
                    .where('id', id)
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
        } else {
            knex('listings')
                .update(listing)
                .where('id', id)
                .then(resp => {
                    console.log(resp)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    },
    async getByCategory(category, currentLocation) {
        const listings = await knex('listings')
            .select()
            .where('category', category)
            .limit(50)
            .then(response => {
                return response
            })
            .catch(err => {
                console.log(err)
            })
            for (var i = 0; i < listings.length; i++) {
                let length = await GeoCode.findDistance(listings[i], currentLocation)
                if (length < 50) {
                    listings[i].distance = true
                } else {
                    listings[i].distance = false
                }
            }
            return listings
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
    async getBySearch(title, currentLocation, cb) {
        const listings = await knex('listings')
            .select()
            .where('business_title', 'like', `${title}%`)
            .then(async response => {
                return response
            })
            .catch(err => {
                console.log(err)
            })
        for (var i = 0; i < listings.length; i++) {
            let length = await GeoCode.findDistance(listings[i], currentLocation)
            if (length < 50) {
                listings[i].distance = true
            } else {
                listings[i].distance = false
            }
        }
        return listings
    }, 
    getById(id, cb) {
        return knex('listings')
            .select()
            .where('id', id)
            .then(resp => {
                cb.status(200).json(resp)
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({message: 'listing does not exist'})
            })
    }
}

module.exports = Listings