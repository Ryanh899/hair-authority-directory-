const keys = require('./api/config/env-config'); 
//set the development config for knex to connect to pgsql 
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : 'root',
      database : 'postgres',
      charset: 'utf8', 
      // ssl: true
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },
  staging: {
    client: 'pg',
    connection: {
      host : keys.dbHost,
      user : keys.dbUser,
      password : keys.dbPassword,
      database : keys.db,
      charset: 'utf8', 
      ssl: true
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },

  production:{
    client: 'pg',
    connection: {
      host : keys.prodDbHost,
      user : keys.prodDbUser,
      password : keys.prodDbPswd,
      database : keys.prodDb,
      charset: 'utf8', 
      ssl: true
    },
    // migrations: {
    //   directory: __dirname + '/knex/migrations',
    // },
    // seeds: {
    //   directory: __dirname + '/knex/seeds'
    // }
  },
};
