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
      if (error.response.status === 401) {
        return authHelper.logOut("./sign-in.html");
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
          return false;
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
    zohoRedirectCheck () {
      const url = window.location.href.split('='); 
      const redirectId = url[1]; 
      if (redirectId) {
        return redirectId
      } else {
        return false
      }
    }, 
    subId__check () {
        const subId = JSON.parse(sessionStorage.getItem('subscription_id')); 
        if (subId) {
          now = new Date();
          expiration = new Date(subId.timestamp);
          expiration.setMinutes(expiration.getMinutes() + 30);
      
          // ditch the content if too old
          if (now.getTime() > expiration.getTime()) {
    
    
              return false
          } else {
            return true
          }
        } else {
          return false 
        }
      }, 
      claim__check () {
        const claim = JSON.parse(sessionStorage.getItem('claimListing')); 
    
        if (claim) {
          now = new Date();
          expiration = new Date(claim.timestamp);
          expiration.setMinutes(expiration.getMinutes() + 30);
    
          // ditch the content if too old
          if (now.getTime() > expiration.getTime()) {
              return false
          } else {
            return true
          }
        } else {
          return false 
        }
      }
  };

  const planCodes = [ 
    {
    code: 'free-trial', 
    price: '$0.00',
    plan: 'Free Trial'
    }, {
    code: 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08', 
    price: '$29.99', 
    plan: 'Light Access'
    },{
    code: 'ea78d785-2a2c-4b74-b578-fab3509b669c', 
    price: '$49.99', 
    plan: 'Standard Access'
    },{
    code: '2528891f-8535-41dc-b07e-952b25113bd0', 
    price: '$79.99', 
    plan: 'Premium Access'
    }
]

const ZOHO_URL = 'http://localhost:3000/zoho/'

$(document).ready(function () {
    const page = document.querySelector('div#page-container'); 
    const loader = document.querySelector('div#loader-div')

    $(page).css('display', 'none')

    const hostedCheck = authHelper.zohoRedirectCheck(); 
    const claimCheck = authHelper.claim__check(); 
    const storageCheck = { subscription_id: sessionStorage.getItem('subscription_id'), customer_id: sessionStorage.getItem('customer_id'), listing_id: sessionStorage.getItem('listing_id') }; 

    if ( hostedCheck && claimCheck ) {
        const hostedId = hostedCheck
        console.log(hostedId)
    
        myAxios.post(ZOHO_URL + 'hostedpage/retrieve/claim', { hostedId, token: sessionStorage.getItem('token'), listing_id: JSON.parse(sessionStorage.getItem('claimListing')).value } )
            .then(async response => {
                console.log(response)
                if (!response.data.exists) {
                    let plan = planCodes.filter(x => x.code === response.data.subscription[0].plan_code); 
                    let now = new Date();
                    let current; 
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, 1);
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    }
                    console.log(plan)
                    console.log(current)

                    $('#subInfo').append(`<p class="plan-text">Your subscription to Hair Authority Directory, ${plan[0].plan}, is successful. An amount of ${plan[0].price} will be charged on ${current}</p>`)
                    sessionStorage.removeItem('claimListing'); 
                    $(loader).css('display', 'none')
                    $(page).css('display', '')
                } else {
                    alert('your subscription could not be completed at this time') 
                    $(loader).css('display', 'none')
                    $(page).css('display', '')
                }
                
            }).catch(err => {
                console.log(err)
            })

    } else if (storageCheck) {
        console.log(storageCheck)
        $(loader).css('display', 'none')
        $(page).css('display', '')
    }

      $("body").on("click", "#home-button", function() {

        sessionStorage.setItem('lastLocation', 'thank-you')
        window.location.assign('index.html')
      });

}); 