const knex = require('../config/knex/knex'); 

module.exports = {
    getAll () {
        knex('hair_authority')
            .select()
    }
}