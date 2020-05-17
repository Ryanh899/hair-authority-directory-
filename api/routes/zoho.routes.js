const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Superagent = require("superagent");
const axios = require("axios");
const Zoho = require('../models/zoho'); 
const keys = require('../config/env-config'); 
const User = require('../models/user'); 
const Listings = require('../models/listings');
const knex = require('../config/knex/knex'); 

// Zoho routes 
// promise to get access token from zoho
function getAccessToken () {
  return new Promise(async (resolve, reject) => {
    // check for access token => Arr or false 
    let checkToken = await Zoho.zohoOAuth(); 
    console.log('Check Token: ', checkToken)
    // if token exists and is valid 
    if (checkToken.refreshToken) {
    // if refresh but not access
      resolve(await Zoho.getAccessToken__passed(checkToken.refreshToken)); 
    } else if (checkToken.accessToken) {
    // if access and refresh 
      resolve(accessToken = checkToken.accessToken); 
    // else 
    } else {
    // generate new token
    reject()
    console.log('Neither')
    }
  })
}

// generate refresh token redirect 
router.get('/generateRefresh', ( req, res ) => {
  // gets access code 
    console.log(req.params.code)

    res.send({ message: "Hit refresh redirect" })
})

router.get('/refreshAccessToken', async (req, res) => {
  const newToken = await Zoho.getAccessToken()
  res.status(200).json({ token: newToken }); 
})

router.post('/hostedpage/create/existing', async (req, res) => {
  const plan = req.body.plan; 
  const customerId = req.body.customer_id;

  getAccessToken()
  .then(accessToken => {
    Superagent.post(`https://subscriptions.zoho.com/api/v1/hostedpages/newsubscription`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", `${process.env.ORGANIZATION_ID}`)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer_id": ${customerId}, 
      "plan": {
        "plan_code": ${plan}
      }
    }`)
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid customer id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(resp => {
      console.log(resp.body);
      res.status(200).json(resp.body)
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err); 
    res.status(400).send(err)
  })
})

router.get("/findCustomer/user/:token", async (req, res) => {
  // params need to be passed in url

  // decode user token for user info
  const user = jwt.decode(req.params.token)

  console.log(user)

  const subscription = await Zoho.getSubscription(user.id); 

  console.log(subscription)
  if (subscription.length) {
    getAccessToken()
    .then(accessToken => {

    Superagent.get(`https://subscriptions.zoho.com/api/v1/customers/${subscription[0].customer_id}`)
      .set(
        "Authorization",
        `Zoho-oauthtoken ${accessToken}`
      )
      .set("X-com-zoho-subscriptions-organizationid", `${process.env.ORGANIZATION_ID}`)
      .set("Content-Type", "application/json;charset=UTF-8")
      .on('error', (err) => {
        let error = JSON.parse(err.response.text)
        const errCode = error.code; 
        if (errCode == 3004) {
          console.log('invalid customer id')
          return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
        }
      })
      .then(resp => {
        console.log(resp.body.customer);
        res.status(200).json(resp.body.customer)
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err); 
      res.status(400).send(err)
    })
  } else {
    res.status(200).json([])
  }
});

router.post('/hostedpage/retrieve/new', async (req, res) => {

  const pageId = req.body.hostedId; 
  const user = jwt.decode(req.body.token); 
  //declare access token
  getAccessToken()
  .then(accessToken => {


  Superagent.get(`https://subscriptions.zoho.com/api/v1/hostedpages/${pageId}`)
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
      console.log(JSON.parse(resp.text));
      const info = JSON.parse(resp.text); 

      const subCheck = await Zoho.subscriptionCheck__id(info.data.subscription.subscription_id); 

      if (!subCheck.length) {
        const subInfo = {
          subscription_id: info.data.subscription.subscription_id, 
          plan_code: info.data.subscription.plan.plan_code, 
          customer_id: info.data.subscription.customer.customer_id, 
          status: info.data.subscription.status, 
          card_id: info.data.subscription.card.card_id,
          user_id: user.id
        }
        console.log(subInfo)
        const addSub = await Zoho.addSubscription__paid(subInfo)
  
        res.json(addSub)
      } else {
        res.status(200).json({ exists: true, subCheck })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err)
    });
  })
  .catch(err => {
    console.log(err); 
    res.status(400).send(err)
  })
})

router.post('/subscription/createfree/new', async (req, res) => {

  getAccessToken()
  .then(async accessToken => {
    console.log(req.body)
    const customerId = jwt.decode(req.body.token); 
  
    console.log(customerId)
    const customer = await User.findId(customerId.id); 
  
    Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions`)
      .set(
        "Authorization",
        `Zoho-oauthtoken ${accessToken}`
      )
      .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
      .set("Content-Type", "application/json;charset=UTF-8")
      .send(`{
        "customer": {
            "display_name": "${customer.first_name} ${customer.last_name}",
            "salutation": "Mr.",
            "first_name": "${customer.first_name}",
            "last_name": "${customer.last_name}",
            "email": "${customer.email}",
          },
        "plan": {
            "plan_code": "free-trial",
        },
        "is_portal_enabled": true,
        "auto_collect": false
    }`)
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
        const pickInfo = _.pick(resp.body.subscription, 'subscription_id', 'plan.plan_code', 'customer.customer_id', 'status', 'card.card_id' )
        const subInfo = {
          subscription_id: pickInfo.subscription_id, 
          plan_code: pickInfo.plan.plan_code, 
          customer_id: pickInfo.customer.customer_id, 
          status: pickInfo.status, 
          user_id: customer.id, 
          card_id: pickInfo.card.card_id
        }
        console.log(subInfo)
        const addSubscription = await Zoho.addSubscription__free(subInfo)
  
        res.json(addSubscription)
  
      })
      .catch(err => {
        console.log(err);
        res.status(err.status).json(err.response); 
      });
  })    
    .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
  
})

router.post('/subscription/createfree/existing', async (req, res) => {

  getAccessToken()
  .then(accessToken => {

  const customerId = req.body.customer_id; 
  const customer = jwt.decode(req.body.token); 



  console.log(customerId)

  Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer_id": "${customerId}",
      "plan": {
          "plan_code": "free-trial",
      },
      "is_portal_enabled": true,
      "auto_collect": false
  }`)
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
      const pickInfo = _.pick(resp.body.subscription, 'subscription_id', 'plan.plan_code', 'customer.customer_id', 'status', 'card.card_id' )
      const subInfo = {
        subscription_id: pickInfo.subscription_id, 
        plan_code: pickInfo.plan.plan_code, 
        customer_id: pickInfo.customer.customer_id, 
        status: pickInfo.status, 
        user_id: customer.id, 
        card_id: pickInfo.card.card_id
      }
      console.log(subInfo)
      const addSubscription = await Zoho.addSubscription__free(subInfo)

      res.json(addSubscription)

    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  })    
    .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
})

// router.post('/subscription/hostedpage', (req, res) => {

// })

router.post('/subscription/claimfree/existing', async (req, res) => {

  getAccessToken()
  .then(async accessToken => {


  console.log(accessToken)
  // get customer info from req
  console.log(req.body)
  const customerId = req.body.customer_id; 
  const listingId = req.body.claim

  const listingTitle = await Listings.getListingTitle__id(listingId)
  console.log(customerId)
  console.log(listingTitle); 

// if listing is not claimed + getting title 
if ( listingTitle && listingTitle.length ) {

    Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions`)
      .set(
        "Authorization",
        `Zoho-oauthtoken ${accessToken}`
      )
      .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
      .set("Content-Type", "application/json;charset=UTF-8")
      .send(`{
        "customer_id": "${customerId}",
        "customer": {
          "company_name": "${listingTitle}"
        },
        "plan": {
            "plan_code": "free-trial",
        },
        "is_portal_enabled": true,
        "auto_collect": false
    }`)
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
        const pickInfo = _.pick(resp.body.subscription, 'subscription_id', 'plan.plan_code', 'customer.customer_id', 'status', 'card.card_id' )
        const subInfo = {
          subscription_id: pickInfo.subscription_id, 
          plan_code: pickInfo.plan.plan_code, 
          customer_id: pickInfo.customer.customer_id, 
          status: pickInfo.status, 
          user_id: customer.id, 
          listing_id: listingId, 
          card_id: pickInfo.card.card_id
        }
        const claimInfo = _.pick(subInfo, 'user_id', 'subscription_id', 'listing_id')

        console.log(subInfo)
        const addPendingClaim = await Listings.addPendingClaim(claimInfo)
        const addSubscription = await Zoho.addSubscription__free(subInfo)

        res.json({ subscription: addSubscription, claim: addPendingClaim })

      })
      .catch(err => {
        console.log(err);
        res.status(err.status).json(err.response); 
      });
    } else {
      res.status(401).json({ message: "This business has already been claimed" })
    }
  })
  .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
})

router.post('/subscription/claimfree/new', async (req, res) => {

  //declare access token
 getAccessToken()
 .then(async accessToken => {

  // get customer info from req
  console.log(req.body)
  const customerId = jwt.decode(req.body.token); 
  const listingId = req.body.claim

  const listingTitle = await Listings.getListingTitle__id(listingId)
  console.log(listingTitle); 


  console.log(customerId)
  const customer = await User.findId(customerId.id); 

  // if listing is not claimed + getting title 
if ( listingTitle && listingTitle.length) {

  Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer": {
          "display_name": "${customer.first_name} ${customer.last_name}",
          "salutation": "Mr.",
          "first_name": "${customer.first_name}",
          "last_name": "${customer.last_name}",
          "email": "${customer.email}",
          "company_name": "${listingTitle}"
        },
      "plan": {
          "plan_code": "free-trial",
      },
      "is_portal_enabled": true,
      "auto_collect": false
  }`)
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
      const pickInfo = _.pick(resp.body.subscription, 'subscription_id', 'plan.plan_code', 'customer.customer_id', 'status', 'card.card_id' )
      const subInfo = {
        subscription_id: pickInfo.subscription_id, 
        plan_code: pickInfo.plan.plan_code, 
        customer_id: pickInfo.customer.customer_id, 
        status: pickInfo.status, 
        user_id: customer.id, 
        listing_id: listingId, 
        card_id: pickInfo.card.card_id
      }
      const claimInfo = _.pick(subInfo, 'user_id', 'subscription_id', 'listing_id')

      console.log(subInfo)
      const addPendingClaim = await Listings.addPendingClaim (claimInfo)
      const addSubscription = await Zoho.addSubscription__free(subInfo)

      res.json({ subscription: addSubscription, claim: addPendingClaim })

    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  } else {
    res.status(401).json({ message: "This business has already been claimed" })
  }
})
.catch(err => {
  console.log(err);
  res.status(err.status).json(err)
});
})

router.post('/hostedpage/retrieve/claim', async (req, res) => {

  getAccessToken ()
  .then(accessToken => {

  const pageId = req.body.hostedId; 
  const user = jwt.decode(req.body.token); 
  const listing_id = req.body.listing_id


  Superagent.get(`https://subscriptions.zoho.com/api/v1/hostedpages/${pageId}`)
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
      console.log(JSON.parse(resp.text));
      const info = JSON.parse(resp.text); 

      const subCheck = await Zoho.subscriptionCheck__id(info.data.subscription.subscription_id); 

      console.log('Sub Check', subCheck); 
      if (!subCheck.length) {
        const subInfo = {
          subscription_id: info.data.subscription.subscription_id, 
          plan_code: info.data.subscription.plan.plan_code, 
          customer_id: info.data.subscription.customer.customer_id, 
          status: info.data.subscription.status, 
          user_id: user.id, 
          listing_id
        }
        const claimInfo = _.pick(subInfo, 'user_id', 'subscription_id', 'listing_id')
        console.log(claimInfo)

        console.log(subInfo)
        const addPendingClaim = await Listings.addPendingClaim(claimInfo)
        const addSub = await Zoho.addSubscription__paid(subInfo)
        
        console.log(addPendingClaim)
        console.log(addSub)
        res.json({ subscription: addSub, claim: addPendingClaim })
      } else {
        console.log('Reason')
        res.status(200).json({ exists: true, subCheck })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err)
    });
  })
  .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
})

router.post('/hostedpage/claim/existing', async (req, res) => {

  getAccessToken()
  .then(accessToken => {

  const plan = req.body.plan; 
  const customerId = req.body.customer_id;


  const thankYouUrl = 'https://hairauthoritydirectory.s3.amazonaws.com/thank-you.html'

  Superagent.post(`https://subscriptions.zoho.com/api/v1/hostedpages/newsubscription`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", `${process.env.ORGANIZATION_ID}`)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer_id": ${customerId}, 
      "plan": {
        "plan_code": ${plan}
      }, 
      "is_portal_enabled": true,
      "redirect_url": "${thankYouUrl}"
    }`)
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid customer id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(resp => {
      console.log(resp.body);
      res.status(200).json(resp.body)
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
})

router.post('/hostedpage/claim/new', async (req, res) => {

  getAccessToken()
  .then(async accessToken => {

  const plan = req.body.plan; 
  const customerId = jwt.decode(req.body.token).id 

  console.log(customerId)
  const customer = await User.findId(customerId); 

  Superagent.post(`https://subscriptions.zoho.com/api/v1/hostedpages/newsubscription`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", `${process.env.ORGANIZATION_ID}`)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer": {
        "display_name": "${customer.first_name} ${customer.last_name}",
        "first_name": "${customer.first_name}",
        "last_name": "${customer.last_name}",
        "email": "${customer.email}",
      },
      "plan": {
        "plan_code": ${plan}
      }, 
      "is_portal_enabled": true,
      "redirect_url": "${thankYouUrl}"
    }`)
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid customer id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(resp => {
      console.log(resp.body);
      res.status(200).json(resp.body)
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
    res.status(err.status).json(err)
  });
})

router.post('/subscription/createfree/existing', async (req, res) => {

  getAccessToken()
  .then(async accessToken => {

  // get customer info from req
  console.log(req.body)
  const customerId = req.body.customer_id; 



  console.log(customerId)

  Superagent.post(`https://subscriptions.zoho.com/api/v1/subscriptions`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "customer_id": "${customerId}",
      "plan": {
          "plan_code": "free-trial",
      },
      "is_portal_enabled": true,
      "auto_collect": false
  }`)
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
      const pickInfo = _.pick(resp.body.subscription, 'subscription_id', 'plan.plan_code', 'customer.customer_id', 'status', 'card.card_id' )
      const subInfo = {
        subscription_id: pickInfo.subscription_id, 
        plan_code: pickInfo.plan.plan_code, 
        customer_id: pickInfo.customer.customer_id, 
        status: pickInfo.status, 
        user_id: customer.id, 
        card_id: pickInfo.card.card_id
      }
      console.log(subInfo)
      const addSubscription = await Zoho.addSubscription__free(subInfo)

      res.json(addSubscription)

    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  })

})

router.post('/subscription/cancel', async (req, res) => {

  getAccessToken()
  .then(accessToken => {


  console.log(accessToken)
  // get customer info from req
  console.log(req.body)
  const subscription_id = req.body.subscription_id; 



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
      const getListing = await Listings.getListing__id(resp[0]); 
      return { listing: getListing, listingId: resp[0] }
    })
    .then(resp => {
      return Listings.addToInactive(resp)
    })
    .then(resp => {
      res.json(resp)
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  })
  .catch(err => {
    console.log(err);
    res.status(err.status).json(err.response); 
  });
})

router.put('/subscription/update', async (req, res) => {

  getAccessToken()
  .then(async accessToken => {

  console.log(accessToken)
  // get customer info from req
  console.log(req.body)
  const listing_id = req.body.listingId; 
  const user = jwt.decode(req.body.token); 
  const plan = req.body.plan; 

  const subscription = await Zoho.subscriptionCheck__listingId(listing_id); 
  console.log(subscription)

  if (subscription.length) {
    Superagent.put(`https://subscriptions.zoho.com/api/v1/subscriptions/${subscription[0].subscription_id}`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", process.env.ORGANIZATION_ID)
    .set("Content-Type", "application/json;charset=UTF-8")
    .send(`{
      "plan": {
        "plan_code": "${plan}",
      },
      "auto_collect": true,
    }`
    )
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
      return knex('subscriptions').update('plan_code', plan).where('subscription_id', subscription[0].subscription_id)
    })
    .then(resp => {
      res.json(resp)
    })
    .catch(err => {
      console.log(err);
      res.status(err.status).json(err.response); 
    });
  }
})  
  .catch(err => {
  console.log(err);
  res.status(err.status).json(err.response); 
});


}); 

router.get("/testoauth", async (req, res) => {
  // params need to be passed in url
  getAccessToken()
  .then(accessToken => {
  // if i dont get access token err handling
  console.log(accessToken)
  Superagent.get(`https://subscriptions.zoho.com/api/v1/customers/2198615000000081003`)
    .set(
      "Authorization",
      `Zoho-oauthtoken ${accessToken}`
    )
    .set("X-com-zoho-subscriptions-organizationid", `${process.env.ORGANIZATION_ID}`)
    .set("Content-Type", "application/json;charset=UTF-8")
    .on('error', (err) => {
      let error = JSON.parse(err.response.text)
      const errCode = error.code; 
      if (errCode == 3004) {
        console.log('invalid customer id')
        return res.status(404).json({ error: 'Invalid customer Id', code: 3004 })
      }
    })
    .then(resp => {
      console.log(resp.body.customer);
      res.status(200).json(resp.body.customer)
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    res.status(400).send(err)
  })


});


module.exports = router;

// 1000.081743a133d1744a366ca051e0463a73.0ac9eeb589ee62312ec05c9f1c1db819&location=us
