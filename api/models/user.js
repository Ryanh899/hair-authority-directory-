const knex = require('../config/knex/knex');
const _ = require('lodash');
const Auth = require('../../auth_resources');

const User = {
    findEmail(userInfo){
        return knex('users')
            .select()
            .where('email', userInfo)
            .then(response => {
              return response  
            })
            .catch(err => {
                console.log(err); 
            })
    },
    getHashInfo(userInfo) {
        return knex('users')
            .select('hash', 'salt')
            .where('email', userInfo.email)
            .then(response => {
                console.log('created user: ', response); 
                return response[0];
            })
            .catch(err => {
                console.log(err);
            })
    }, 

};

module.exports = User; 