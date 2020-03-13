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

        sessionStorage.setItem('plan', plan)
        sessionStorage.setItem('lastLocation', 'billing__new')
        if (plan === 'free-access') window.location.assign('listing.check.html')
        else if (plan === 'light-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/d2f4f1f0-1ad5-4c3a-912d-6646a5a46d08")
        else if (plan === 'standard-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/ea78d785-2a2c-4b74-b578-fab3509b669c")
        else if (plan === 'premium-access') window.open("https://subscriptions.zoho.com/subscribe/2b47bf8abcb465deb8e32adfbb4e9754a7726ba08b65d6ccad482bf477cf719e/2528891f-8535-41dc-b07e-952b25113bd0")
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