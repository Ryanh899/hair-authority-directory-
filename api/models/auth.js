const knex = require('../config/knex/knex');
const User = require('./user'); 
const Auth = require('../../auth_resources'); 

module.exports = {
    async register(userInfo) {
        const userTest = await User.findEmail(userInfo.email);
        console.log( userTest)
            if (userTest.length === 0) {
                const salt = Auth.generateSalt();
                const hash = Auth.generateHash(salt, userInfo.password);
                return knex('users')
                    .insert({
                        email: userInfo.email,
                        salt: salt,
                        hash: hash
                    })
                    .then(response => {
                        console.log('user created', response); 
                        return response;  
                    })
                    .catch(err => {
                        console.log(err)
                        throw err
                    })
            } else {
                console.log('user exists')
            }
    },
}