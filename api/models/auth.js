const knex = require('../config/knex/knex');
const User = require('./user'); 
const Auth = require('../../auth_resources'); 
const jwt = require('jsonwebtoken'); 
const _ = require('lodash'); 
const keys = require('../config/env-config'); 

module.exports = {
    async register(userInfo, cb) {
        const userTest = await User.findEmail(userInfo.email);
        console.log( userTest)
            if (userTest.length === 0) {
                const salt = Auth.generateSalt();
                const hash = Auth.generateHash(salt, userInfo.password);
                return knex('users')
                    .insert({
                        email: userInfo.email.toLowerCase(),
                        salt: salt,
                        hash: hash
                    })
                    .then(response => {
                        console.log('user created', response); 
                        cb.status(200).send(response)
                    })
                    .catch(err => {
                        console.log(err)
                        throw err
                    })
            } else {
                console.log('user already exists')
                cb.status(401).send({ error: 'user already exists' })
            }
    },
    async logIn(attemptedUser, cb) {
        const userInfo = await User.findEmail(attemptedUser.email)
        if (userInfo && userInfo.length !== 0) {
            console.log(userInfo); 
            const attemptedHash = Auth.generateHash(userInfo.salt, attemptedUser.password); 
            if (attemptedHash === userInfo.hash) {
                const toSend = _.pick(userInfo, 'id', 'email')
                if (userInfo.isClientUser) toSend.isClientUser = true; 
                else if (userInfo.isProfessionalUser) toSend.isProfessionalUser = true; 
                else if (userInfo.isAdminUser) toSend.isAdminUser = true; 
                const token = await jwt.sign(
                    toSend,
                    keys.privateKey,
                    { expiresIn: "6h" }
                  );
                  return cb.status(200).send(token); 
            } else {
                console.log('password error')
                return cb.status(401).send({ error: 'incorrect email or password' })
            }
        } else {
            console.log('user does not exist error')
            cb.status(401).send({ error: 'user does not exist' })
        }
    }
}