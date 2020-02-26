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
  const titleSection = document.querySelector("div#title-section");
  const contactLine = document.querySelector("hr#contact-hr");
  const locationAddr = document.querySelector("a#location-address");
  const carousel = document.querySelector("ul#content");

  $(page).css("dislplay", "none");

  function getGeolocation() {
    console.log("map");
    navigator.geolocation.getCurrentPosition(drawMap);
  }

  function drawMap(geoPos) {
    geolocate = new google.maps.LatLng(
      geoPos.coords.latitude,
      geoPos.coords.longitude
    );
    let mapProp = {
      center: geolocate,
      zoom: 10
    };
    let map = new google.maps.Map(document.getElementById("map"), mapProp);
  }

  function showPosition(position) {
    sessionStorage.setItem("lat", position.coords.latitude);
    sessionStorage.setItem("lng", position.coords.longitude);
  }

  const currentLocation = {
    lat: sessionStorage.getItem("lat"),
    lng: sessionStorage.getItem("lng")
  };

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  function showPosition(position) {
    sessionStorage.setItem("lat", position.coords.latitude);
    sessionStorage.setItem("lng", position.coords.longitude);
  }

  let location = {
    lat: sessionStorage.getItem("lat"),
    lng: sessionStorage.getItem("lng")
  };

  getGeolocation();

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

  function splitPhone(number) {
    if (number) {
      let newNumber = number.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
      console.log(newNumber);
      return newNumber;
    } else {
      return;
    }
  }

  console.log(currentListing);
  console.log(currentLocation);
  if (currentListing && currentLocation) {
    myAxios
      .get(API_URL + "listing/" + currentListing)
      .then(response => {
        $(loader).css("display", "none");
        $(page).css("display", "");
        console.log(response);

        const listing = response.data;
        splitPhone(listing.phone);
        // let filteredImg = listing.images.filter(x => x.image_path !== "true");
        // filteredImg.forEach(image => {
        //   if (image.image_path !== "false" ) {
        //     $(carousel).append(`<li class="ui card">
        //     <div class="ui image">
        //       <img
        //         class="ui fluid image"
        //         src="https://ha-images-02.s3-us-west-1.amazonaws.com/${image.image_path || "placeholder.png"}"
        //       />
        //     </div>
        //   </li>`);
        //   } else {
        //     console.log('no path')
        //   }
        // });

        $("#header-image").append(
          ` <img class="ui rounded image" src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image}" />`
        );

        $(titleSection).prepend(
          `<p  class="listing_category" >${listing.category}</p>  <p style="color: #3aa7a3;;" id="claimed" >Claimed <i style="color: #3aa7a3;;" class="check icon" ></i></p>`
        );

        $(titleSection).prepend(
          '<h1 style="margin-top: 1rem" class="listing_h1" >' +
            listing.business_title +
            "</h1>"
        );

        if (listing.phone) {
          $("#phone-content").append(
            `<a class="contact-info" >${listing.phone}</a>`
          );
        } else {
          $("#phone-div").css("display", "none");
        }

        if (listing.email) {
          $("#email-content").append(
            `<a class="contact-info" >${listing.email}</a>`
          );
        } else {
          $("#email-div").css("display", "none");
        }

        if (listing.socialMedia) {
          if (listing.socialMedia.some(x => x.platform === "instagram")) {
            const ig = listing.socialMedia.filter(
              x => x.platform === "instagram"
            );
            $("#social-media").append(
              `<a  class="contact-info" href="${ig[0].url}" ><button style="background: #3f729b;"  class="ui circular facebook icon button">
                <i style="background: #3f729b;" class="instagram icon"></i>
              </button></a>`
            );
          } else {
            $("#instagram-div").css("display", "none");
          }

          if (listing.socialMedia.some(x => x.platform === "linkedin")) {
            const linkedin = listing.socialMedia.filter(
              x => x.platform === "linkedin"
            );
            $("#social-media").append(
              `<a class="contact-info" href="${linkedin[0].url}" ><button class="ui circular facebook icon button">
                <i class="linkedin icon"></i>
              </button></a>`
            );
          } else {
            $("#linkedin-div").css("display", "none");
          }

          if (listing.socialMedia.some(x => x.platform === "facebook")) {
            const facebook = listing.socialMedia.filter(
              x => x.platform === "facebook"
            );
            $("#social-media").append(
              `<a class="contact-info" href="${facebook[0].url}" ><button class="ui circular facebook icon button">
                <i class="facebook icon"></i>
              </button></a>`
            );
          } else {
            $("#facebook-div").css("display", "none");
          }
        }

        $("#section-header").append(
          `<p id="listing_description" >${listing.business_description}</p>`
        );

        $(locationAddr).append(
          `<i class="directions icon" ></i>  ${listing.full_address}  `
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
