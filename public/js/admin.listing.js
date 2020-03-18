// axios interceptor and creater
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
      console.log(error)
    }
  );
  
  //auth helper functions
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
  
  // API URL
  // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
  let API_URL = "http://localhost:3000/api/";
  const googleApiKey = "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo";
  
  // days of the week for business hours
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];
  
  // parse youtube
  function YouTubeGetID(url) {
    var ID = "";
    url = url
      .replace(/(>|<)/gi, "")
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    } else {
      ID = url;
    }
    return ID;
  }
  
  // get channel from user url
  function getChannelFromUrl(url) {
    var pattern = new RegExp(
      "^(https?://)?(www.)?youtube.com/(user/)?([a-z-_0-9]+)/?([?#]?.*)",
      "i"
    );
    var matches = url.match(pattern);
    if (matches) {
      return matches[4];
    }
  
    return url;
  }
  
  function getChannelIdFromUrl(url) {
    var pattern = /^(?:(http|https):\/\/[a-zA-Z-]*\.{0,1}[a-zA-Z-]{3,}\.[a-z]{2,})\/channel\/([a-zA-Z0-9_]{3,})$/;
    var matchs = url.match(pattern);
    if (!matchs === null) {
      return matchs[2];
    } else {
      return;
    }
  }
  
  function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  const ADMIN_URL = "http://localhost:3000/admin/";
  
  // on ready
  $(document).ready(function() {

    const page = document.querySelector("div#listing-page-container");
    const loader = document.querySelector("div#loader-div");
    const listingColumn = document.querySelector("div#listing-column");
    const titleSection = document.querySelector("div#title-section");
   // function to initiate map
  function getGeolocation() {
    console.log("map");
    // navigator.geolocation.getCurrentPosition(drawMap);
    drawMap();
  }

  // function called by getGeolocation
  async function drawMap(geoPos) {
    // map center coords
    let geolocate;

    // if listing coords exist
    if (
      sessionStorage.getItem("listing-lat") !== "null" &&
      sessionStorage.getItem("listing-lng") !== "null"
    ) {
      console.log("COORDINATES");
      geolocate = new google.maps.LatLng(
        parseFloat(sessionStorage.getItem("listing-lat")),
        parseFloat(sessionStorage.getItem("listing-lng"))
      );

      // create map props for map generator
      let mapProp = {
        center: geolocate,
        zoom: 10,
        disableDefaultUI: true,
        zoomControl: false
      };
      // call google maps api to append the map to the #map div
      let map = new google.maps.Map(document.getElementById("map"), mapProp);
      // create a marker for the business
      let marker = new google.maps.Marker({
        position: geolocate,
        map: map,
        animation: google.maps.Animation.DROP
      });
      // reveal page and hide loader
      $("#images").css("dislplay", "");
      $(loader).css("display", "none");
      $(page).fadeIn(250)
    }
    // if the address exists
    else if (sessionStorage.getItem("listing-address") !== "null") {
      console.log("ADDRESS");
      // google geo coder init
      let geocoder = new google.maps.Geocoder();
      // get the address
      let full_address = sessionStorage.getItem("listing-address");
      console.log(full_address);
      // hit the google api with the address to get coordinates
      geocoder.geocode({ address: full_address }, function(results, status) {
        if (status == "OK") {
          console.log(results);
          geolocate = results[0].geometry.location;
          // create map props for map generator
          let mapProp = {
            center: geolocate,
            zoom: 10,
            disableDefaultUI: true,
            zoomControl: false
          };
          // call google maps api to append the map to the #map div
          let map = new google.maps.Map(
            document.getElementById("map"),
            mapProp
          );
          // create a marker for the business
          let marker = new google.maps.Marker({
            position: geolocate,
            map: map,
            animation: google.maps.Animation.DROP
          });
          // reveal page and hide loader
          $("#images").css("dislplay", "");
          $(loader).css("display", "none");
          $(page).fadeIn(250)
        } else {
          console.log(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
      // if no location get current location
    } else {
      // console.log("OTHER");
      // geolocate = new google.maps.LatLng(
      //   geoPos.coords.latitude,
      //   geoPos.coords.longitude
      // );
      //  // create map props for map generator
      //  let mapProp = {
      //   center: geolocate,
      //   zoom: 10,
      //   disableDefaultUI: true,
      //   zoomControl: false
      // };
      // // call google maps api to append the map to the #map div
      // let map = new google.maps.Map(
      //   document.getElementById("map"),
      //   mapProp
      // );
      // // create a marker for the business
      // let marker = new google.maps.Marker({
      //   position: geolocate,
      //   map: map,
      //   animation: google.maps.Animation.DROP
      // });
      // reveal page and hide loader
      $("#images").css("dislplay", "");
      $(loader).css("display", "none");
      $(page).css("display", "");
    }
  }

  // grabbing location from session storage
  let location = {
    lat: sessionStorage.getItem("listing-lat"),
    lng: sessionStorage.getItem("listing-lng")
  };

  // calling function to init map
  getGeolocation();

  // getting the current listing id from session storage
  const currentListing = sessionStorage.getItem("currentListing");

  if (currentListing) {
    // hit the api for the listing data by the id
    myAxios
      .get(ADMIN_URL + "listing/" + currentListing)
      .then(async response => {
          console.log(response)
          const listing = response.data.listing; 
          const user = response.data.user; 
          const subscription = response.data.subscription
          console.log(listing, user, subscription)

          const title = document.querySelector("input#business_title");
          const description = document.querySelector("textarea#business_description");
          const address = document.querySelector("input#street_address");
          const city = document.querySelector("input#city");
          const state = document.querySelector("input#state");
          const zip = document.querySelector("input#zip");
          const category = document.querySelector('input#category')
          const categoryDefault =document.querySelector('#category')
          const missionStatement = document.querySelector(
            "textarea#mission_statement"
          );
          const about = document.querySelector("textarea#about");
    
          $(title).attr("value", listing.business_title);
          $(description).attr("value", listing.business_description);
          $(address).attr("value", listing.street_address);
          $(city).attr("value", listing.city);
          $(state).attr("value", listing.state);
          $(zip).attr("value", listing.zip);
          $(missionStatement).attr("value", listing.mission_statement);
          $(about).attr("value", listing.about);
          categoryDefault.textContent = listing.category

          if (listing.tagline) {
            const website = document.querySelector("input#tagline");
            $(website).attr("value", listing.tagline);
          }
    
          if (listing.website) {
            const website = document.querySelector("input#website");
            $(website).attr("value", listing.website);
          }
          if (listing.instagram) {
            const instagram = document.querySelector("input#instagram");
            $(instagram).attr("value", listing.instagram);
          }
          if (listing.facebook) {
            const facebook = document.querySelector("input#facebook");
            $(facebook).attr("value", listing.facebook);
          }
          if (listing.twitter) {
            const twitter = document.querySelector("input#twitter");
            $(twitter).attr("value", listing.twitter);
          }
          if (listing.linkedin) {
            const linkedin = document.querySelector("input#linkedin");
            $(linkedin).attr("value", listing.linkedin);
          }
          if (listing.youtube) {
            const youtube = document.querySelector("input#youtube");
            $(youtube).attr("value", listing.youtube);
          }
          if (listing.phone) {
            const phone = document.querySelector("input#phone");
            $(phone).attr("value", listing.phone);
          }
          if (listing.email) {
            const email = document.querySelector("input#email");
            $(email).attr("value", listing.email);
          }
          if (listing.faq0 && listing.answer0) {
            const faq0 = document.querySelector("input#faq0");
            const answer = document.querySelector("textarea#answer0");
    
            $(faq0).attr("value", listing.faq0);
            $(answer).attr("value", listing.answer0);
          }
          if (listing.faq1 && listing.answer1) {
            const faq1 = document.querySelector("input#faq1");
            const answer = document.querySelector("textarea#answer1");
    
            $(faq1).attr("value", listing.faq1);
            $(answer).attr("value", listing.answer1);
          }
          if (listing.faq2 && listing.answer2) {
            const faq2 = document.querySelector("input#faq2");
            const answer = document.querySelector("textarea#answer2");
    
            $(faq2).attr("value", listing.faq2);
            $(answer).attr("value", listing.answer2);
          }

      })
      .catch(err => {
          console.log(err)
      })
  }

  $(".ui.dropdown").dropdown({
    allowAdditions: true
  });
  });
  