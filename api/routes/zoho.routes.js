const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Superagent = require("superagent");
const axios = require("axios");

const Zoho = {};

const zohoOauth = {
  access_token:
    "1000.375b2e233c6e6b2ac50a38aaf4d9eaba.33c1d31a6975e7baa22c48ea9498a0ec",
  refresh_token:
    "1000.3dd6c7de496ef574f6996a615a0dfde3.94ea6ee6f2ddeddaba6042b04a8048f8",
  api_domain: "https://www.zohoapis.com",
  token_type: "Bearer",
  expires_in: 3600
};

const secondOauth = {
  access_token:
    "1000.10239f998b12e692387859a5f7e0050b.e1ffe25b0def6e2a41ae950cd538b64e",
  refresh_token:
    "1000.f7b9f95a456bb042db7746fd359df4f3.0a4fc127d4eb97bee90cbcd9c184ec4b",
  api_domain: "https://www.zohoapis.com",
  token_type: "Bearer",
  expires_in: 3600
};

router.post("/createCustomer", (req, res) => {
  Superagent.post("https://subscriptions.zoho.com/api/v1/customers")
    .set(
      "Authorization",
      "Zoho-oauthtoken 1000.10239f998b12e692387859a5f7e0050b.e1ffe25b0def6e2a41ae950cd538b64e"
    )
    .set("X-com-zoho-subscriptions-organizationid", "710064782")
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(
      `{
            "display_name": "Bowman Furniture",
            "salutation": "Mr.",
            "first_name": "Benjamin",
            "last_name": "George",
            "email": "benjamin.george@bowmanfurniture.com",
            "company_name": "Bowman Furniture",
            "phone": 23467278,
            "mobile": 938237475,
            "department": "Marketing",
            "designation": "Evangelist",
            "website": "www.bowmanfurniture.com",
            "billing_address": {
                "attention": "Benjamin George",
                "street": "Harrington Bay Street",
                "city": "Salt Lake City",
                "state": "CA",
                "zip": 92612,
                "country": "U.S.A",
                "fax": 4527389
            },
            "shipping_address": {
                "attention": "Benjamin George",
                "street": "Harrington Bay Street",
                "city": "Salt Lake City",
                "state": "CA",
                "zip": 92612,
                "country": "U.S.A",
                "fax": 4527389
            }
        }`
    )
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/generateRefresh", (req, res) => {
  // params need to be passed in url
  axios
    .post(
      "https://accounts.zoho.com/oauth/v2/token?grant_type=authorization_code&client_id=1000.SIX3ISK8PM6ID3DVC2INO65G2YYPWH&client_secret=7f56c4ed10eb417b432e9c1327f423f4b2095da15f&redirect_uri=http://localhost:3000/zoho/generateRefresh/&code=1000.72cc6180a2ed4ce449171360723c6f00.84caa3d6be7713d2b015317ac4223a1f"
    )
    .then(resp => {
      // access token,refresh token, api_domain, token_type, expires in
      console.log(resp.data);
      res.json("token received");
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;

// 1000.081743a133d1744a366ca051e0463a73.0ac9eeb589ee62312ec05c9f1c1db819&location=us
