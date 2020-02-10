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

const API_URL = "http://localhost:3000/api/";
const ADMIN_URL = "http://localhost:3000/admin/";

$(document).ready(function() {
  const page = document.querySelector("div#page-container");
  const loader = document.querySelector("div#loader-div");
  const listingContainer = document.querySelector('div#listing-container')

  $(page).css("display", "none");

  const listingId = sessionStorage.getItem("currentAuthListing");

  myAxios
    .get(ADMIN_URL + "pendingListing/" + listingId)
    .then(response => {
      console.log(response);
      const listing = response.data[0]
       


        
      $(loader).css("display", "none");
      $(page).fadeIn();
      
    })
    .catch(err => {
      console.log(err);
    });

    $('body').on('click', '#back-button', function () {
        window.history.back()
    })
});
