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


$(document).ready(function() {
  const page = document.querySelector("div#page-container");
  const loader = document.querySelector("div#loader-div");
  const listingColumn = document.querySelector("div#listing-column");
  const titleSection = document.querySelector('div#title-section')
  const contactLine = document.querySelector('hr#contact-hr')

  $(page).css("dislplay", "none");

  function getGeolocation() {
    navigator.geolocation.getCurrentPosition(drawMap);
  }
  
  function drawMap(geoPos) {
    geolocate = new google.maps.LatLng(geoPos.coords.latitude, geoPos.coords.longitude);
    let mapProp = {
      center: geolocate,
      zoom: 10,
    };
    let map = new google.maps.Map(document.getElementById('map'), mapProp);
    // if (markerInfo.length > 0) {
    //   markerInfo.forEach(item => {
    //     let marker = new google.maps.Marker({
    //       position: {
    //         lat: Number(item.lat),
    //         lng: Number(item.lng)
    //       },
    //       map: map,
    //       title: 'Hello World!'
    //     })
    //   })
    // }
  
  
  }
  
  function showPosition(position) {
    sessionStorage.setItem('lat', position.coords.latitude)
    sessionStorage.setItem('lng', position.coords.longitude)
  }
  
  const currentLocation = {
    lat: sessionStorage.getItem("lat"),
    lng: sessionStorage.getItem("lng")
  };

  getGeolocation()

  const currentListing = sessionStorage.getItem("currentListing");

  $("#controlR").click(function() {
    event.preventDefault();
    $("#content").animate(
      {
        marginLeft: "-=400px"
      },
      "fast"
    );
  });

  $("#controlL").click(function() {
    event.preventDefault();
    $("#content").animate(
      {
        marginLeft: "+=400px"
      },
      "fast"
    );
  });

  function splitPhone (number) {
      let newNumber = number.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
      console.log(newNumber)
      return newNumber
  }
  if (currentListing && currentLocation) {
    myAxios
      .get(API_URL + "listing/" + currentListing)
      .then(response => {
        $(loader).css("display", "none");
        $(page).css("display", "");
        console.log(response);

        const listing = response.data[0];
        splitPhone(listing.phone)

        $(titleSection).prepend(
          `<p  class="listing_category" >${listing.category}</p>  <p style="color: #446a7f;" id="claimed" >Claimed <i style="color: #446a7f;" class="check icon" ></i></p>`
        );

        $(titleSection).prepend(
          '<h1 style="margin-top: 1rem" class="listing_h1" >' +
            listing.business_title +
            "</h1>"
        );
        $('#phone-content').append(`<a class="contact-info" >${listing.phone}</a>`)
        $('#email-content').append(`<a class="contact-info" >${listing.email}</a>`)

        if (listing.instagram) {
          $('#instagram-content').append(`<a class="contact-info" >${listing.instagram}</a>`)
        } else {
          $('#instagram-div').css('display', 'none')
        }
        
        if (listing.linkedin) {
          $('#linkedin-content').append(`<a class="contact-info" >${listing.linkedin}</a>`)
        } else {
          $('#linkedin-div').css('display', 'none')
        }

        if (listing.facebook) {
          $('#facebook-content').append(`<a class="contact-info" >${listing.facebook}</a>`)
        } else {
          $('#facebook-div').css('display', 'none')
        }

        $('#about-section').prepend(
          `<p id="listing_description" >${listing.business_description}</p>`
        );
        
      })
      .catch(err => {
        console.log(err);
      });
  }

  $("body").on("click", "#back-button", function() {
    window.history.back();
  });
});
