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
                        email: userInfo.email,
                        salt: salt,
                        hash: hash
                    })
                    .then(response => {
                        console.log('user created', response); 
                        jwt.sign()
                        cb.status(200).send(response)
                    })
                    .catch(err => {
                        console.log(err)
                        throw err
                    })
            } else {
                cb.status(400).send({ error: 'user already exists' })
            }
    },
    async logIn(attemptedUser, cb) {
        const userInfo = await User.findEmail(attemptedUser.email)
        if (userInfo.length !== 0) {
            console.log(userInfo); 
            const attemptedHash = Auth.generateHash(userInfo[0].salt, attemptedUser.password); 
            if (attemptedHash === userInfo[0].hash) {
                const toSend = _.pick(userInfo[0], 'id', 'email')
                const token = await jwt.sign(
                    toSend,
                    keys.privateKey,
                    { expiresIn: "6h" }
                  );
                  return cb.status(200).send(token); 
            } else {
                return cb.status(400).send({ error: 'incorrect email or password' })
            }
        } else {
            cb.status(400).send({ error: 'user does not exist' })
        }
    }
}