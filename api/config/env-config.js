//requires dotenv file 
const dotenv = require('dotenv');
dotenv.config();

//exports passwords aliased in camel case
module.exports = {
    dbHost: process.env.DB_HOST,
    db: process.env.DB,
    dbpassword: process.env.DB_PASSWORD,
    dbUser: process.env.DB_USER,
    privateKey: process.env.PRIVATE_KEY
};