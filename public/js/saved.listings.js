var myAxios = axios.create({
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
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
      const token = localStorage.getItem("token");
      if (token) {
        var userData = this.parseToken(token);
        var expirationDate = new Date(userData.exp * 1000);
        if (Date.now() > expirationDate) this.logOut();
        return true;
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
      localStorage.removeItem("token");
    }
  };

  
const API_URL = 'http://localhost:3000/api/'

$(document).ready(function() {
    const listingContainer = document.querySelector('div#listing-container')
    const user = authHelper.parseToken(localStorage.getItem('token'))
    console.log(user)

    // +function getSavedListings () {
    //     myAxios.get(API_URL + 'savedListings/' + user.id)
    // }()
    
})