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
    }, 
    updateCheck () {
        // get from storage 
        const update = JSON.parse(sessionStorage.getItem('update')); 
        // if in storage 
        if (update) {
            // check expiration time... 30 minutes 
            now = new Date();
            expiration = new Date(update.timeStamp);
            expiration.setMinutes(expiration.getMinutes() + 30);
            console.log(expiration)
            // if expired remove from storage return false 
            if (now.getTime() > expiration.getTime()) {
              sessionStorage.removeItem('update')
                return false
            } else {
              return true
            }
          } else {
            return false 
          }
    }
  };

  // err modal 
  function showErrModal (modal, header, description, errHeader, errMessage) {
    $(header).text(errHeader)
    $(description).text(errMessage)

    $(modal).modal('show')
  }

// let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
let API_URL = "http://localhost:3000/api/";
const ZOHO_URL = "http://localhost:3000/zoho/";
  

$(document).ready(function () {

    // check for update in storage 
    const updateCheck = authHelper.updateCheck(); 

    // if doesnt exist run modal and send back
    if (!updateCheck) {
        showErrModal('#error-modal', '#error-header', '#error-description', 'Error', 'You can not update this subscription at this time, please try again later')
    }

    const currentPlan = sessionStorage.getItem('plan'); 

    $(`#${currentPlan}`).text('Current Subscription'); 
    $(`#${currentPlan}`).prop('disabled', true)

    // on continue click
    $('body').on('click', 'button.continue-button', function () {
        // grab listing id from storage
        const update = JSON.parse(sessionStorage.getItem('update')).value; 
        // get user token
        const token = sessionStorage.getItem('token'); 
        // get plan
        const plan = $(this).attr('id'); 

        // send listing id and user info to backend 
        // server will need to update: 
            // 1. subscriptions table update plan_code where listing_id = x
            // 2. hit zoho route 
        myAxios.put(ZOHO_URL + '/subscription/update/', { listingId: update, token, plan })
            .then(response => {
                console.log(response)
                window.location.assign('dashboard.html')
            })
            .catch(err => {
                console.log(err)
            })


    })

    // nav back buttons
    $("body").on("click", "#back-button", function() {

        sessionStorage.setItem('lastLocation', 'search')
        if (sessionStorage.getItem('lastLocation') === 'sign-in' ) {
          window.location.assign('index.html')
        } else {
          window.history.back()
        }
      });
})
