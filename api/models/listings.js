const knex = require('../config/knex/knex'); 

const Listings = {
    getListings(userInfo) {
        console.log(userInfo)
        return knex('listings')
            .select()
            .where('professional_id', userInfo.id)
            .catch(err => console.log(err))
    }, 
    addListing(listing) {
        console.log(listing)
        return knex('listings')
            .insert(listing)
            .then(resp => {
                console.log(resp)
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
    }
}

module.exports = Listings