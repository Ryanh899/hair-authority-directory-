const knex = require("../config/knex/knex");
const axios = require("axios");
const keys = require("../config/env-config");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Superagent = require("superagent");
moment().format();

const Zoho = {
  getAccessToken() {
    return axios
      .post(
        `https://accounts.zoho.com/oauth/v2/token?refresh_token=${keys.zohoRefresh}&client_id=${keys.zohoClientId}&client_secret=${keys.zohoClientSecret}&grant_type=refresh_token`
      )
      .then(resp => {
        console.log(resp.data);
        // set env variable for access code
        const now = moment();
        const hourFrom = moment(now).add(1, "hours");
        knex("zoho_auth")
          .insert({
            client_id: keys.zohoClientId,
            refresh_token: keys.zohoRefresh,
            access_token: resp.data.access_token,
            created_at: now,
            expiry_time: hourFrom
          })
          .catch(err => console.log(err));
        return resp.data.access_token;
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
        const isoStartDate = moment().format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        const isoEndDate = moment(token.expiry_time, "DD/MM/YYYY").format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        console.log(isoEndDate, isoStartDate);
        let duration = moment(isoEndDate).diff(moment(isoStartDate), "hours");
        console.log("duration");
        console.log(duration);
        if (duration >= 1 || duration <= 0) {
          knex("zoho_auth")
            .where("id", token.id)
            .del()
            .catch(err => console.error(err));
          return;
        } else {
          console.log('Else', token)
          return token;
        }
      });
    } else {
      console.log('ELSE ')
      return false;
    }
    return validTokens;
  },
  generateRefreshToken(cb) {
    // params need to be passed in url
    // REMOVE BECAUSE TMI
    axios
      .post(
        `https://accounts.zoho.com/oauth/v2/token?grant_type=authorization_code&client_id=${keys.zohoClientId}&client_secret=${keys.zohoClientSecret}&redirect_uri=https://hadirectoryapi.com/zoho/generateRefresh/&code=${keys.zohoCode}`
      )
      .then(resp => {
        // access token,refresh token, api_domain, token_type, expires in
        console.log(resp.data);
        return knex('extra_refresh')
            .insert('refresh_token', resp.data.refresh_token)
            .then(res => {
                cb.status(200).json({ message: "Token Created and Stored" });
            })
            .catch(err => {
                console.log(err); 
                
            })
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json({ error: err })
      });
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
