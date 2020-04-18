var myAxios = axios.create({
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token")
    }
  });
  myAxios.interceptors.response.use(
    function(response) {
      return response;
    },
    function(error) {
      if (error.response.status === 400) {
        console.log(error.response)
        alert(error.response)
      } else if (error.response.status === 401) {
        console.log(error.response)
        return error
      } else {
        return Promise.reject(error);
      }
    }
  );
  var authHelper = {
    isLoggedIn() {
      const token = sessionStorage.getItem("token");
      if (token) {
        var userData = this.parseToken(token);
        var expirationDate = new Date(userData.exp * 1000);
        if (Date.now() > expirationDate) {
          this.logOut();
          return false 
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    isLoggedIn__professional() {
      const token = sessionStorage.getItem("token");
      if (token) {
        var userData = this.parseToken(token);
        var expirationDate = new Date(userData.exp * 1000);
        if (Date.now() > expirationDate) this.logOut();
        if (userData.isProfessionalUser) {
          return true;
        } else {
          return false
        }
      } else {
        return false;
      }
    },
    parseToken(token) {
      if (token) {
        return JSON.parse(window.atob(token.split(".")[1]));
      }
    },
    logOut() {
      sessionStorage.removeItem("token");
    }, 
    claim__check () {
      const claim = JSON.parse(sessionStorage.getItem('claimListing')); 
  
      if (claim) {
        now = new Date();
        expiration = new Date(claim.timeStamp);
        expiration.setMinutes(expiration.getMinutes() + 30);
        console.log(expiration)
        // ditch the content if too old
        if (now.getTime() > expiration.getTime()) {
          sessionStorage.removeItem('claimListing')
            return false
        } else {
          return true
        }
      } else {
        sessionStorage.removeItem('claimListing')
        return false 
      }
    }
  };

  function showErrModal (modal, header, description, errHeader, errMessage) {
    $(header).text(errHeader)
    $(description).text(errMessage)

    $(modal).modal('show')
  }
  
  // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
  let API_URL = "http://localhost:3000/api/";
  let AUTH_URL = "http://localhost:3000/auth/";
  let ZOHO_URL = "http://localhost:3000/zoho/";

  // window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/46ebc057-9935-4985-9d47-0145bfd47e9a")

$(document).ready(function () {

    // myAxios.get(API_URL + '/findCustomer/' + token)

    // 1. Send user to hosted page for their plan
    // 2. Rediredct URL takes them to form page after succesful payment or back here on failure
    // 3. get hosted page id from url and use it to retrieve user info by making another api call with it
    // 4. get succesful results, subscription info, plan info, card info, customer info, invoice and payment info
    // 5. get customer id, balance, payment_id, plan_code and put in zoho status table

    if (authHelper.claim__check()) {
      $('#free-access').prop('disabled', true); 
      $('#free-col').css('display', 'none')
    }

    if ( !authHelper.isLoggedIn() ) {
      console.log('Not logged in')
      showErrModal('#error-modal', '#error-header', '#error-description', 'Account Error', 'You must be signed in to create a subscription')
    }

    $('body').on('click', '.continue-button', async function (e) {
        let plan = this.id; 
        $('#billing-loader-div').css('display', 'block')
        const claimCheck = await authHelper.claim__check(); 
        console.log('claim check:', claimCheck)

        sessionStorage.setItem('plan', plan)
        sessionStorage.setItem('lastLocation', 'billing__new')
        if (authHelper.isLoggedIn() && !claimCheck ) {
          const token = sessionStorage.getItem('token')
          myAxios.get(`http://localhost:3000/zoho/findcustomer/user/${token}`)
            .then(customer => {
              console.log(customer)
              if (customer.data && customer.data.length) {
                const customer_id = customer.data.customer_id
                const token = sessionStorage.getItem('token')
                if (plan === 'free-access' ) {
                  myAxios.post('http://localhost:3000/zoho/subscription/createfree/existing', { customer_id, token })
                    .then(subscription => {
                      console.log(subscription)
                      if (subscription.status === 200) {
                        sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: subscription.data[0].subscription_id}))
                        sessionStorage.setItem('customer_id', subscription.data[0].customer_id)
                        sessionStorage.setItem('plan', 'free-trial')
                        window.location.assign('listing.form.html')
                      } else {
                        alert('There was an error')
                      }
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'light-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'standard-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: 'ea78d785-2a2c-4b74-b578-fab3509b669c'  })
                    .then(response => {
                      response = response.data.hostedpage
                      console.log(response)
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'premium-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: '2528891f-8535-41dc-b07e-952b25113bd0'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }

              } else if (customer.data || customer.data.length) {
                const customer_id = customer.data.customer_id
                const token = sessionStorage.getItem('token')
                if (plan === 'free-access' ) {
                  myAxios.post('http://localhost:3000/zoho/subscription/createfree/existing', { customer_id, token })
                    .then(subscription => {
                      console.log(subscription)
                      if (subscription.status === 200) {
                        sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: subscription.data[0].subscription_id}))
                        sessionStorage.setItem('customer_id', subscription.data[0].customer_id)
                        sessionStorage.setItem('plan', 'free-trial')
                        window.location.assign('listing.form.html')
                      } else {
                        alert('There was an error')
                      }
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'light-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'standard-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: 'ea78d785-2a2c-4b74-b578-fab3509b669c'  })
                    .then(response => {
                      response = response.data.hostedpage
                      console.log(response)
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'premium-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.data.customer_id, plan: '2528891f-8535-41dc-b07e-952b25113bd0'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
              } else if (!customer.data && !customer.data.length) {
                console.log('new lsiting, not existing customer')
                if (plan === 'free-access' ) {
                  myAxios.post('http://localhost:3000/zoho/subscription/createfree/new', { token })
                    .then(resp => {
                      console.log(resp)
                      if (resp.status === 200) {
                        sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: resp.data[0].subscription_id}))
                        sessionStorage.setItem('customer_id', resp.data[0].customer_id)
                        sessionStorage.setItem('plan', 'free-trial')
                        window.location.assign('listing.form.html')
                      } else {
                        alert('There was an error')
                      }
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'light-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/d2f4f1f0-1ad5-4c3a-912d-6646a5a46d08", '_self')
                else if (plan === 'standard-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/ea78d785-2a2c-4b74-b578-fab3509b669c", '_self')
                else if (plan === 'premium-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/2528891f-8535-41dc-b07e-952b25113bd0", '_self')
              } else if (sessionStorage.getItem('token') === null ) {
                alert('You must be signed in to create a subscription')
                window.location.assign('sign-in.html')
              } 
            })
            .catch(err => {
              console.log(err)
              if (err.status === 401) {
                console.log('Not existing user')
              }
            })

          // 1. Make claim routes and models in zoho.routes + zoho, should do the same thing sub info wise
          // 2. needs to put claim in pending claims, put sub info in subs table, charge user and record it in zoho
          // 3. claim hosted pages need different REDIRECT URL
            // Steps: 
              // 1. Click claim --> <signed-in> --> billing page -->  create subscription (free (API), paid (HOSTED): both have customer info/id + plan_code)
              // 2. Free: create sub (plan, customer) --> insert pending claim (listing_id, user_id) --> insert subscription (listing_id, sub_id, user_id, customer_id)
              // 3. Paid: create hosted page (plan, customer) --> on redirect retreive hosted page --> insert pending claim --> insert subscription (listing_id, sub_id, user_id, customer_id)
              // 4. Free + Paid: End at home page, let client know he will be emailed upon verification. 
          
          // if its a claim
          } else if ( authHelper.isLoggedIn() && claimCheck ) {
            console.log('Claim')
            // get listing to be claimed 
            const claim = JSON.parse(sessionStorage.getItem('claimListing')).value
            // get user token 
            const token = sessionStorage.getItem('token')
            // check to see if user is an existing zoho customer 
            myAxios.get(`http://localhost:3000/zoho/findcustomer/user/${token}`)
              .then(customer => {
                console.log(customer)
                // if customer 
              if (customer.status === 200 && customer.data) {
                // set customer id (zoho)
                const customer_id = customer.customer_id
                // if free plan
                if (plan === 'free-access' ) {
                  // create sub with existing customer id for free plan 
                    // 1. Get response --> insert into subs table --> insert into claims table --> send back status 
                  myAxios.post('http://localhost:3000/zoho/subscription/claimfree/existing', { customer_id, claim })
                    .then(subscription => {
                      console.log(subscription)
                      // if succesful 
                      if (subscription.status === 200) {
                       window.location.assign('thank-you.html')
                      } else {
                        alert('Failed')
                      }
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                //light --existing claim 
                else if (plan === 'light-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/claim/existing', { customer_id: customer.data.customer_id, plan: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                // standard --existing claim 
                else if (plan === 'standard-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/claim/existing', { customer_id: customer.data.customer_id, plan: 'ea78d785-2a2c-4b74-b578-fab3509b669c'  })
                    .then(response => {
                      response = response.data.hostedpage
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                // premium --existing claim 
                else if (plan === 'premium-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/claim/existing', { customer_id: customer.data.customer_id, plan: '2528891f-8535-41dc-b07e-952b25113bd0'  })
                    .then(response => {
                      response = response.data.hostedpage
                      console.log(response)
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
              // if not existing zoho customer 
              } else if (customer.status === 200 && !customer.data.length) {
                if (plan === 'free-access' ) {
                  // create sub with existing customer id for free plan 
                    // 1. Get response --> insert into subs table --> insert into claims table --> send back status 
                  myAxios.post('http://localhost:3000/zoho/subscription/claimfree/new', { token, claim })
                    .then(subscription => {
                      console.log(subscription)
                      // if succesful 
                      if (subscription.status === 200) {
                       window.location.assign('thank-you.html')
                      } else {
                        alert('Failed')
                      }
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'light-access') myAxios.post(ZOHO_URL + '/hostedpage/claim/new', { token, plan: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08'  })
                .then(response => {
                  console.log(response)
                  window.open(response.data.hostedpage.url, '_self')
                })
                .catch(err => {
                  console.log(err)
                })
                else if (plan === 'standard-access') myAxios.post(ZOHO_URL + '/hostedpage/claim/new', { token, plan: 'ea78d785-2a2c-4b74-b578-fab3509b669c'  })
                .then(response => {
                  console.log(response)
                  window.open(response.data.hostedpage.url, '_self')
                })
                .catch(err => {
                  console.log(err)
                })
                else if (plan === 'premium-access') myAxios.post(ZOHO_URL + '/hostedpage/claim/new', { token, plan: '2528891f-8535-41dc-b07e-952b25113bd0'  })
                .then(response => {
                  console.log(response)
                  window.open(response.data.hostedpage.url, '_self')
                })
                .catch(err => {
                  console.log(err)
                })
              } else if (!sessionStorage.getItem('token')) {
                alert('You must be signed in to create a subscription')
                window.location.assign('sign-in.html')
              }
            })
            .catch(err => {
              console.log(err)
              if (err.status === 401) {
                console.log('Not existing user')
              }
              })
              .catch(err => {
                console.log(err)
              })
            
          } else if ( !authHelper.isLoggedIn() ) {
            console.log('Not logged in')
            showErrModal('#error-modal', '#error-header', '#error-description', 'Account Error', 'You must be signed in to create a subscription')
          }
    }); 

    $("body").on("click", "#back-button", function() {

        sessionStorage.setItem('lastLocation', 'search')
        if (sessionStorage.getItem('lastLocation') === 'sign-in' ) {
          window.location.assign('index.html')
        } else {
          window.history.back()
        }
      });
})