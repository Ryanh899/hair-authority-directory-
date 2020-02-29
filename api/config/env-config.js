//requires dotenv file 
const dotenv = require('dotenv');
dotenv.config();

//exports passwords aliased in camel case
module.exports = {
    dbHost: process.env.DB_HOST,
    db: process.env.DB,
    dbpassword: process.env.DB_PASSWORD,
    dbUser: process.env.DB_USER,
    privateKey: process.env.PRIVATE_KEY, 
    googleDevKey: process.env.GOOGLE_DEV_API_KEY, 
    prodDb: process.env.AWS_DB, 
    prodDbHost: process.env.AWS_HOST, 
    prodDbPswd: process.env.AWS_PSWD, 
    prodDbUser: process.env.AWS_USER

};