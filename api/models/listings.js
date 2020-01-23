const knex = require('../config/knex/knex'); 

const Listings = {
    getListings(userInfo) {
        return knex('listings')
            .select()
            .where('id', userInfo.id)
            .catch(err => console.log(err))
    }
}

module.exports = Listings