const crypto = require('crypto');
const keys = require('./api/config/env-config'); 

const Auth = {
    generateSalt () {
        return crypto.randomBytes(32).toString("hex");
    }, 
    generateHash(salt, password) {
        const hash = crypto
            .pbkdf2Sync(password, salt, 100000, 64, "sha512")
            .toString("hex");
            return hash; 
    }, 
    
}; 

module.exports = Auth; 