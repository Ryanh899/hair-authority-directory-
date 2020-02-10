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
      // return authHelper.logOut("./sign-in.html");
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

function getPendingListings(loader, page) {
  myAxios
    .get(ADMIN_URL + "pendingListings")
    .then(response => {
      const listings = response.data;
      console.log(response);
      $(loader).css("display", "none");
      $(page).fadeIn();
      if (listings.length > 0) {
        listings.forEach(listing => {
            $("#pending-div")
              .append(`<div style="margin-bottom: 1rem;" class="listingItem ui grid">
                <div class="row">
                  <div class="six wide middle aligned column">
                    <p class="listingTitle">
                      ${listing.business_title}
                    </p>
                    <p class="listingSubtitle">${listing.business_description}</p>
                  </div>
                  <div class="six wide column"></div>
                  <div class="four wide column">
                    <a id="${listing.id}" class="viewButton">
                      <div style="color: white;" class="listing-buttons " id="${listing.id}">
                        <i style="pointer-events:none" class="eye icon"></i> View
                      </div>
                    </a>
                    <a id="${listing.id}" class="verifyButton">
                      <div  style="color: white;" class="listing-buttons ">
                        <i id="${listing.id}" style="pointer-events:none" style="color: red;" class="check icon"></i>
                        Verify
                      </div>
                    </a>
                  </div>
                </div>
              </div>`);
          });
      } else {
          $('#pending-div').append('No Pending Listings')
      }
      
    })
    .catch(err => {
      console.log(err);
    });
}

$(document).ready(function() {
  const loader = document.querySelector("div#loader-div");
  const page = document.querySelector("div#dashboard-container");
  const homeButton = document.querySelector("div#home-button");

  $(page).css("display", "none");
  getPendingListings(loader, page);

  $("body").on("click", "#home-button", function() {
    window.location.assign("index.html");
  });

  $("body").on("click", ".viewButton", function() {
    const id = $(this).attr("id");

    sessionStorage.setItem("currentAuthListing", id);
    window.location.assign("listing.auth.html");
  });

  $("body").on("click", "#newListing", function() {
    window.location.assign('listing.form.html')
  });

  $("body").on("click", "#home-icon-button", function() {
    window.location.assign('index.html')
  });

  $("body").on("click", "#logout-button", function() {
    localStorage.removeItem('token')
    window.location.assign('index.html')
  });

  $("body").on("click", ".verifyButton", function() {
    const id = $(this).attr("id");
    console.log(id)

    myAxios.post(ADMIN_URL + 'verifyListing', {id: id})
        .then(response => {
            console.log(response)
            alert('user verified')
            $(this).fadeOut()
        })
        .catch(err => {
            console.log(err)
        })
  });
});
