const knex = require("../config/knex/knex");
const axios = require("axios");
const keys = require("../config/env-config");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Superagent = require("superagent");
moment().format();

const Zoho = {
  getAccessToken__query() {
    const refreshToken = knex('zoho_auth').select('refresh_token').then(resp => resp[0]).catch(err => console.error(err)); 
    // hit zoho to generate access with passed in refresh
    return axios
      .post(
        `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${keys.zohoClientId}&client_secret=${keys.zohoClientSecret}&grant_type=refresh_token`
      )
      .then(async resp => {
        console.log(resp.data);
        const now = moment();
        const expiryTime = moment().minute(30);
        await knex("zoho_auth")
                .insert({
                  client_id: keys.zohoClientId,
                  refresh_token: refreshToken,
                  access_token: resp.data.access_token,
                  created_at: now,
                  expiry_time: expiryTime
                })
                .returning('id', 'access_token')
                .then(async data => {
                  await knex('zoho_auth').where({ id: (data[0].id-1) }).delete(); 
                  return data[0].access_token
                })
                .catch(err => console.log(err));
      })
      .catch(err => {
        console.error(err);
      });
  },
  async getAccessToken__passed(refreshToken) {
    let accessToken; 
    return axios
      .post(
        `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${keys.zohoClientId}&client_secret=${keys.zohoClientSecret}&grant_type=refresh_token`
      )
      .then(async resp => {
        accessToken = resp.data.access_token; 
        const now = moment().format("YYYY-MM-DD[T]HH:mm:ss");
        const expiryTime = moment(now).add(30, 'm').format("YYYY-MM-DD[T]HH:mm:ss");
        return knex("zoho_auth")
                .insert({
                  client_id: keys.zohoClientId,
                  refresh_token: refreshToken,
                  access_token: resp.data.access_token,
                  created_at: now,
                  expiry_time: expiryTime
                })
                .returning('id', 'access_token')
                .catch(err => console.log(err));
      })
      .then(async data => {
        const previous = data[0] - 1
        return knex('zoho_auth').where({ id: previous }).delete(); 
      })
      .then(done => {
        return accessToken;
      })
      .catch(err => {
        console.error(err);
      });
  },
  async getAccessToken () {
    // get refresh
    const refreshToken = await knex('zoho_auth').select(); 
    let accessToken; 
    // hit zoho to generate access with passed in refresh
    return axios
      .post(
        `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken[0].refresh_token}&client_id=${keys.zohoClientId}&client_secret=${keys.zohoClientSecret}&grant_type=refresh_token`
      )
      .then(async resp => {
        accessToken = resp.data.access_token
        const now = moment().format("YYYY-MM-DD[T]HH:mm:ss");
        const expiryTime = moment(now).add(30, 'm').format("YYYY-MM-DD[T]HH:mm:ss");
        const insert = await knex("zoho_auth")
                .insert({
                  client_id: keys.zohoClientId,
                  refresh_token: refreshToken[0].refresh_token,
                  access_token: resp.data.access_token,
                  created_at: now,
                  expiry_time: expiryTime
                })
                .returning('id', 'access_token')
                .then(async data => {
                  const previous = data[0] - 1
                  return knex('zoho_auth').where({ id: previous }).delete(); 
                })
                .then(done => {
                  return accessToken; 
                })
                .catch(err => console.log(err));
                return insert; 
      }).then(access => {
        return access
      })
      .catch(err => {
        console.error(err);
      });
  },
  async checkAccessToken() {
    let tokens = await knex("zoho_auth")
      .select()
      .then(resp => {
        console.log(resp);
        if (resp.length) {
          return resp;
        } else {
          return false;
        }
      });
    let validTokens;
    console.log(tokens)
    if (tokens) {
      validTokens = await tokens.filter(token => {
        const currentTime = moment().format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        const expiryTime = moment(token.expiry_time, "DD/MM/YYYY").format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        console.log(currentTime, expiryTime);
        let duration = moment(currentTime).isAfter(expiryTime, 'minute');
        console.log("duration");
        console.log(duration);
        if (!duration) {
          // if expired return false 
          return false
        } else {
          // else return the token / resp
          console.log('Valid Token:', token)
          return token;
        }
      });
    } else {
      console.log('ELSE')
      return false;
    }
    return validTokens;
  },
  generateAccessCode (res) {
    // generate access code by hitting zoho api 
    axios
      .post(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoSubscriptions.invoices.CREATE,ZohoSubscriptions.invoices.READ,ZohoSubscriptions.invoices.UPDATE,ZohoSubscriptions.invoices.DELETE,ZohoSubscriptions.customers.CREATE,ZohoSubscriptions.customers.UPDATE,ZohoSubscriptions.customers.READ,ZohoSubscriptions.customers.DELETE&client_id=${keys.zohoClientId}&response_type=code&redirect_uri=https://hadirectoryapi.com/zoho/generateRefresh&access_type=offline`)
      .then(resp => {
        return res.send(resp)
      }).catch(err => {
        console.log(err)
      })
  }, 
  async zohoOAuth () {
    // check for / get access, refresh, expiry from db 
    const data = await knex('zoho_auth')
                  .select()
                  .then(resp => {
                    console.log('current tokens: ', resp)
                    return resp
                  })
                  .catch(err => console.error(err)); 
    
    // validate access token if exists
    if (data && data.length) {
      // formatting current and expiry time to compare
      const currentTime = moment().format("YYYY-MM-DD[T]HH:mm:ss");
      const expiryTime = moment(data[0].expiry_time).format("YYYY-MM-DD[T]HH:mm:ss"); 

      console.log('current time is after expiry: ', moment(currentTime).isAfter(expiryTime) )
      // switched to generate new token
      // if the current time is after the expiry time 
      if ( moment(currentTime).isAfter(expiryTime) && data[0].refresh_token ) {
        // token is expired 
        return { refreshToken: data[0].refresh_token }; 
      } else {
        // token is valid 
        return { accessToken: data[0].access_token }; 
      }
    } else {
      return false
    }
  },
  getSubscription (userId) {
    return knex("subscriptions")
      .select()
      .where('user_id', userId)
      .then(response => {
        return response
      }).catch(err => {
        console.log(err)
      })
  }, 
  addSubscription__free (subInfo) {
    console.log(subInfo)
    return knex('subscriptions')
      .insert(subInfo)
      .returning('*')
      .then(response => {
        return response
      })
      .catch(err => {
        console.log(err)
      })
  }, 
  addSubscription__paid (subInfo) {
    console.log(subInfo)
    return knex('subscriptions')
      .insert(subInfo)
      .returning('*')
      .then(response => {
        return response
      })
      .catch(err => {
        console.log(err)
        return false 
      })
      
  }, 
  subscriptionCheck__id (subId) {
    console.log(subId)
    return knex('subscriptions')
      .select()
      .where('subscription_id', subId)
      .then(response => {
        console.log(response)
        return response
      })
      .catch(err => {
        console.log(err)
        return false 
      })
  }, 
  subscriptionCheck__userId (userId) {
    return knex('subscriptions')
            .select()
            .where('user_id', userId)
            .then(response => {
              return response
            }).catch(err => {
              console.log(err)
            })
  }, 
  subscriptionCheck__listingId (listingId) {
    return knex('subscriptions')
            .select()
            .where('listing_id', listingId)
            .then(response => {
              return response
            }).catch(err => {
              console.log(err)
            })
  }, 
  async denyClaim (subscription_id, res) {
    // declare access token
  let accessToken; 

  // check for access token => Arr or false 
  let checkToken = await Zoho.checkAccessToken()
  console.log(checkToken)

  // if token exists and is valid 
  if (checkToken && checkToken.length) {
    // access token equals this token 
    accessToken = checkToken[0].access_token; 
    // else 
  } else {
    // generate new token
    accessToken = await Zoho.getAccessToken(); 
  }

  console.log(accessToken)
  console.log(subscription_id)

  Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions/${subscription_id}/cancel?cancel_at_end=true`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid page id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(async resp => {
      console.log(resp.body);
      return knex('subscriptions').update('status', 'cancelled').where('subscription_id', subscription_id).returning('listing_id', 'subscription_id')
    })
    .then(async resp => {
      return knex('pending_claims').del().where('subscription_id', subscription_id)
    })
    .then(resp => {
      console.log(resp)
      res.json(resp)
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  }, 
  async unverifyClaim (subscription_id, res) {
    // declare access token
  let accessToken; 

  // check for access token => Arr or false 
  let checkToken = await Zoho.checkAccessToken()
  console.log(checkToken)

  // if token exists and is valid 
  if (checkToken && checkToken.length) {
    // access token equals this token 
    accessToken = checkToken[0].access_token; 
    // else 
  } else {
    // generate new token
    accessToken = await Zoho.getAccessToken(); 
  }

  console.log(accessToken)
  console.log(subscription_id)

  Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions/${subscription_id}/cancel?cancel_at_end=true`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid page id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(async resp => {
      console.log(resp.body);
      return knex('subscriptions').update('status', 'cancelled').where('subscription_id', subscription_id).returning('listing_id', 'subscription_id').returning('listing_id')
    })
    .then(async resp => {
      const listing_id = resp[0]; 
      console.log(resp)
      return knex('listings').update({ professional_id: null, claimed: 'false' }).where('id', listing_id)
    })
    .then(resp => {
      console.log(resp)
      res.json(resp)
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  }
  , 
  async updateSubscription (subscription_id, res) {
    // declare access token
  let accessToken; 

  // check for access token => Arr or false 
  let checkToken = await Zoho.checkAccessToken()
  console.log(checkToken)

  // if token exists and is valid 
  if (checkToken && checkToken.length) {
    // access token equals this token 
    accessToken = checkToken[0].access_token; 
    // else 
  } else {
    // generate new token
    accessToken = await Zoho.getAccessToken(); 
  }

  console.log(accessToken)
  console.log(subscription_id)

  Superagent.put(`https://subscriptions.zoho.com/api/v1/subscriptions/${subscription_id}`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid page id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(async resp => {
      console.log(resp.body);
      return knex('subscriptions').update('status', 'cancelled').where('subscription_id', subscription_id).returning('listing_id', 'subscription_id').returning('listing_id')
    })
    .then(async resp => {
      const listing_id = resp[0]; 
      console.log(resp)
      return knex('listings').update({ professional_id: null, claimed: 'false' }).where('id', listing_id)
    })
    .then(resp => {
      console.log(resp)
      res.json(resp)
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  }
};

module.exports = Zoho;
