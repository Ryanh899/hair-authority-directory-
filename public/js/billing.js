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
        if (Date.now() > expirationDate) this.logOut();
        return true;
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
    }
  };
  
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

    $('body').on('click', '.continue-button', function (e) {
        let plan = this.id; 
        let claimCheck = sessionStorage.getItem('claim')

        sessionStorage.setItem('plan', plan)
        sessionStorage.setItem('lastLocation', 'billing__new')
        if (sessionStorage.getItem('token')) {
          const token = sessionStorage.getItem('token')
          myAxios.get(`http://localhost:3000/zoho/findcustomer/user/${token}`)
            .then(customer => {
              console.log(customer)
              if (customer.status === 200 && customer.data.length) {
                const customer_id = customer.customer_id
                if (plan === 'free-access' ) {
                  myAxios.post('http://localhost:3000/zoho/subscription/createfree/existing', { customer_id })
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
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.customer_id, plan: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08'  })
                    .then(response => {
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'standard-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.customer_id, plan: 'ea78d785-2a2c-4b74-b578-fab3509b669c'  })
                    .then(response => {
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }
                else if (plan === 'premium-access') {
                  myAxios.post(ZOHO_URL + '/hostedpage/create/existing', { customer_id: customer.customer_id, plan: '2528891f-8535-41dc-b07e-952b25113bd0'  })
                    .then(response => {
                      window.open(response.url, '_self')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                }

              } else if (customer.status === 200 && !customer.data.length) {
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
              } else {
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

            // if user exists in zoho we hit the route to make a payment page / create subscription for existing customer 

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