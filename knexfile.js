// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'heroku_241a0556662d230',
      user:     'b2026cd7a3898b',
      password: 'a6a31581', 
      host: '@us-cdbr-iron-east-05.cleardb.net',
      charset: 'utf8', 
      ssl: true
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
