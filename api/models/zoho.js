const knex = require("../config/knex/knex");
const axios = require("axios");
const keys = require("../config/env-config");
const moment = require("moment");
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
            refresh_token: keys.refresh_token,
            access_token: resp.data.access_token,
            created_at: now,
            expiry_time: hourFrom
          })
          .catch(err => console.error(err));
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
    if (tokens) {
      validTokens = await tokens.filter(token => {
        const IsoStartDate = moment(token.created_at, "DD/MM/YYYY").format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        const IsoEndDate = moment(token.expiry_time, "DD/MM/YYYY").format(
          "YYYY-MM-DD[T]HH:mm:ss"
        );
        console.log(IsoEndDate, IsoStartDate);
        let duration = moment(IsoStartDate).diff(moment(IsoEndDate), "hours");
        console.log("duration");
        console.log(duration);
        if (duration >= 1) {
          knex("zoho_auth")
            .where("id", token.id)
            .del()
            .catch(err => console.error(err));
          return;
        } else {
          return token;
        }
      });
    } else {
      return false;
    }
    return validTokens;
  },
  generateRefreshToken(cb) {
    // params need to be passed in url
    // REMOVE BECAUSE TMI
    axios
      .post(
        "https://accounts.zoho.com/oauth/v2/token?grant_type=authorization_code&client_id=1000.SIX3ISK8PM6ID3DVC2INO65G2YYPWH&client_secret=7f56c4ed10eb417b432e9c1327f423f4b2095da15f&redirect_uri=http://localhost:3000/zoho/generateRefresh/&code=1000.72cc6180a2ed4ce449171360723c6f00.84caa3d6be7713d2b015317ac4223a1f"
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
                console.error(err); 
                
            })
      })
      .catch(err => {
        console.log(err);
        cb.status(400).json({ error: err })
      });
  }, 
};

module.exports = Zoho;