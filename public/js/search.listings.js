// const categories = [
//   {
//     title: "Dermatologists"
//   },
//   {
//     title: "Hair Care Salons"
//   },
//   {
//     title: "Hair Loss / Hair Care Products & Treatments"
//   },
//   {
//     title: "Hair Replacement & Hair Systems"
//   },
//   {
//     title: "Laser Therapy"
//   },
//   {
//     title: "Medical + Hair Transplants"
//   },
//   {
//     title: "Trichologist"
//   },
//   {
//     title: "Wigs, Extensions, Hair Additions"
//   },
//   {
//     title: "The Hair Club",
//     abbreviation: ""
//   },
//   {
//     title: "ARTAS Robotic Hair Restoration System"
//   },
//   {
//     title: "World Trichology Society",
//     abbreviation: "WTS"
//   },
//   {
//     title: "The International Society of Hair Restoration Surgery (ISHRS)",
//     abbreviation: "ISHRS"
//   }
// ];

const newCategories = [
  { title: "Hair Loss / Hair Care Products &amp" },
  { title: "Treatments|Hair Replacement &amp" },
  { title: "Hair systems|Laser Therapy" },
  {
    title:
      "Hair systems|Medical / Hair Transplants|Wigs, Extensions, Hair Additions"
  },
  { title: "Hair Care Salons|Hair Replacement &amp" },
  { title: "Medical / Hair Transplants" },
  { title: "Wigs, Extensions, Hair Additions" },
  { title: "Trichologists" }
];

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
    console.log(error);
    if (error.response.status === 401) {
      console.log(error.response)
    } else if (error.response.status === 404) {
      console.log("coordinates not found");
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
  parseToken(token) {
    return JSON.parse(window.atob(token.split(".")[1]));
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
  isLoggedIn__admin() {
    const token = sessionStorage.getItem("token");
    if (token) {
      const userData = this.parseToken(token);
      const expirationDate = new Date(userData.exp * 1000);
      const adminToken = this.parseToken(userData.adminToken);
      const expirationDate__admin = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate || Date.now() > expirationDate__admin) this.logOut();
      if (userData.isAdminUser && adminToken.admin ) {
        return true;
      } else {
        return false
      }
    } else {
      return false;
    }
  },
  logOut(path = "./sign-in.html") {
    sessionStorage.removeItem("token");
  }
};

function pageNumbers (listings) {
    if (listings.length > 50) {

    }
}

$(document).ready(function() {

  let geocoder; 

  let distance = sessionStorage.getItem('distance') || 80467; 

  $(`#${distance}`).addClass('active')

  function initialize() {
    geocoder = new google.maps.Geocoder();
  
  }
  
  initialize(); 
  function getCity (lat, lng, city) {
    return new Promise((resolve, reject) => {
    let latlng
      if (!city) {
        latlng = { 'latLng': new google.maps.LatLng(lat, lng)}
      } else {
        latlng = { 'address' : city }
      }
      geocoder.geocode(latlng, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
       console.log(results)
         if (results[1]) {
          //formatted address
          console.log(results[0].formatted_address)
         //find country name
         let city = `${results[1].address_components[2].long_name}, ${results[1].address_components[4].short_name}`
        //       for (var i=0; i<results[0].address_components.length; i++) {
        //      for (var b=0;b<results[0].address_components[i].types.length;b++) {
    
        //      //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
        //          if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
        //              //this is the object you are looking for
        //              city= results[0].address_components[i];
        //              break;
        //          }
        //      }
        //  }
         //city data
         resolve(city)
    
    
         } else {
           resolve() 
         }
       } else {
        resolve() 
       }
     });
    })
  }
  
  function changeLocation (city) {
    return new Promise((resolve, reject) => {
      let latlng = { 'address' : city }
        geocoder.geocode(latlng, function(results, status) {
         if (status == google.maps.GeocoderStatus.OK) {
         console.log(results)
          resolve(results[0]);
         } else {
          resolve() 
         }
       });
      })
  }
  
  
  async function showPosition(position, city) {
    console.log(position); 
    console.log(city)
    if (!city) {
      sessionStorage.setItem("lat", position.coords.latitude);
      sessionStorage.setItem("lng", position.coords.longitude);
      const currentAddress = await getCity(position.coords.latitude, position.coords.longitude); 

      location.coords.latitude = sessionStorage.getItem('lat')
      location.coords.longitude = sessionStorage.getItem('lng')
      console.log('current address: ' + currentAddress)
      console.log(currentAddress)
      $('#location').attr('placeholder', currentAddress); 
      $(loader).hide()
    } else {
  
      const currentAddress = await changeLocation(city); 
  
      sessionStorage.setItem("current-lat", currentAddress.geometry.location.lat());
      sessionStorage.setItem("current-lng", currentAddress.geometry.location.lng());
      sessionStorage.setItem("lat", currentAddress.geometry.location.lat());
      sessionStorage.setItem("lng", currentAddress.geometry.location.lng());

      location.coords.latitude = sessionStorage.getItem('current-lat')
      location.coords.longitude = sessionStorage.getItem('current-lng')
  
      console.log('current address: ' + currentAddress); 
      console.log(currentAddress); 
      $('#location').attr('placeholder', currentAddress); 
      $(loader).hide()
    }
  }
  
  
  function getLocation(city) {
    console.log([...arguments].length)
    if (navigator.geolocation && ![...arguments].length) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else if([...arguments].length) {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  
  
  
    getLocation();

  const page = document.querySelector("div#page-container");
  const loader = document.querySelector("div#loader-div");
  // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
  let API_URL = "http://localhost:3000/api/";
  // if (process.env.NODE_ENV = 'production') {
  //   console.log(env)
  //   API_URL = "ec2-54-90-69-186.compute-1.amazonaws.com/api/";
  // } else {
  //   API_URL = "http://localhost:3000/api/";
  // }

  let location = {
    coords: {
      latitude: 28.438080,
      longitude: -81.472870
    }
  };

  $(page).css("display", "none");

if (sessionStorage.getItem('current-lat') && sessionStorage.getItem('current-lng')) {
  location.coords.latitude = sessionStorage.getItem('current-lat')
  location.coords.longitude = sessionStorage.getItem('current-lng')
} else {
  console.log('current location not in SS')
}

let markerInfo = [];

async function drawMap(geoPos, city) {
  markerInfo = []; 
    let geolocate; 
    if (geoPos) {
      geolocate = new google.maps.LatLng(
        geoPos.coords.latitude,
        geoPos.coords.longitude
      );
    } else {
      geolocate = await new Promise((resolve, reject) => {
        let latlng = { 'address' : city }
        geocoder.geocode(latlng, function(results, status) {
         if (status == google.maps.GeocoderStatus.OK) {
         console.log(results)
         const currentAddress = results[0]; 
          resolve(new google.maps.LatLng(
            currentAddress.geometry.location.lat(),
            currentAddress.geometry.location.lng()
          ));
         } else {
           resolve()
         }
       });
      })
      
    }
    console.log(geolocate)
    let mapProp = {
      center: geolocate,
      zoom: 9, 
      disableDefaultUI: true,
      zoomControl: true
    };
    let map = new google.maps.Map(document.getElementById("map"), mapProp);
    console.log(markerInfo)
    if (markerInfo.length > 0) {
      markerInfo.forEach(item => {
        let marker = new google.maps.Marker({
          position: {
            lat: Number(item.lat),
            lng: Number(item.lng)
          },
          map: map,
          title: item.business_title, 
          animation:google.maps.Animation.DROP, 
          
        });
        let infowindow = new google.maps.InfoWindow({
          content: `<p class="markerText" >${item.business_title}</p> <p class="markerText" >${item.full_address}</p>`
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      });
    }
    
    $(loader).fadeOut();
    $(page).fadeIn();
  }

  const categories = [
    { title: "Dermatologist" },
    { title: "Hair Care Salons" },
    { title: "Hair Loss / Hair Care Products & Treatments" },
    { title: "Hair Replacement & Hair Systems" },
    { title: "Laser Therapy" },
    { title: "Medical / Hair Transplants" },
    { title: "Trichologist" },
    { title: "Medical Hair Restoration" },
    { title: "Wigs / Extensions & Hair Additions" },
    { title: "The Hair Club", abbreviation: "" },
    { title: "ARTAS Robotic Hair Restoration System" },
    { title: "World Trichology Society", abbreviation: "Trichologist" },
    {
      title: "The International Society of Hair Restoration Surgery (ISHRS)",
      abbreviation: "ISHRS"
    }
  ];

  $(".ui #seach-search").search({
    source: categories,
    searchFields: ["title", "abbreviation"],
    fullTextSearch: false,
    showNoResults: false
  });

  $("body").on("click", "#back-button", function() {
    // remove search query
    sessionStorage.removeItem('searchQuery')
    // go back
    window.history.back(); 
  });  

  // $("body").on("click", "#search-button", function() {
  //   const search = document.querySelector("input#search-search").value.trim();
  //   console.log(search);

  //   sessionStorage.setItem("searchQuery", search);
  //   window.location.assign("search.listings.html");
  // });

  $("body").on("click", "a#search-button", async function() {
    $(loader).show()
    let search; 
    document.querySelector("input#request").value.trim() ? search = document.querySelector("input#request").value.trim() : search = sessionStorage.getItem('searchQuery')
    const location = document.querySelector('input#location').value.trim(); 
    console.log(search); 
    console.log(location)

    if (location !== '') {
      await showPosition(null, location); 
      sessionStorage.setItem('location', location); 
    }
    sessionStorage.setItem("lastLocation", "index");
    sessionStorage.setItem("searchQuery", search);

    searchListings()
    // window.location.assign("search.listings.html");
  });

  $("body").on("click", "#home-button", function() {

    sessionStorage.setItem('lastLocation', 'search')

    window.location.assign("index.html");
  });

  $("body").on("click", "button.distanceButtons", function() {
    if ($(this).attr('id') !== distance) {
      $(this).addClass('active'); 
      $(`#${distance}`).removeClass('active'); 

      distance = $(this).attr('id'); 
      sessionStorage.setItem('distance', distance); 

      console.log(distance)
    }
    
  });

  

  // function getLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(showPosition);
  //   } else {
  //     console.log("Geolocation is not supported by this browser.");
  //   }
  // }

  // function showPosition(position) {
  //   sessionStorage.setItem("lat", position.coords.latitude);
  //   sessionStorage.setItem("lng", position.coords.longitude);
  // }
  let allListings = []; 

  function searchListings () {
  $("#listings-column").html('')

  allListings = []; 
    
  let search = sessionStorage.getItem("searchQuery");
  const logoSearch = sessionStorage.getItem('logoSearch')

  let category = "";
  let association = ""; 

  // check if it is a category
  categories.forEach(item => {
    if (search && item.title.toLowerCase() === search.toLowerCase()) {
      category = search;
    }
  });

  if (category === "" && !logoSearch) {
    myAxios
      .get(
        API_URL + "search/" + search + "/" + location.coords.latitude + "+" + location.coords.longitude + '/' + distance
      )
      .then(response => {
        allListings = response.data
        let searchAppend = ''
        sessionStorage.getItem('searchQuery') ? searchAppend = sessionStorage.getItem('searchQuery') : searchAppend = category; 
        $('input.request').val(searchAppend)
        console.log(response);
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${searchAppend}" in your area.`
          );
          $('#request').attr('placeholder', searchAppend)
          $(loader).fadeOut();
          $(page).fadeIn();
          if (sessionStorage.getItem('location')) {
            $('#location').attr('placeholder', sessionStorage.getItem('location'))
            drawMap(null, sessionStorage.getItem('location'))
          } else {
            drawMap(location)
          }
        } else {
          let searchAppend = ''
        sessionStorage.getItem('searchQuery') ? searchAppend = sessionStorage.getItem('searchQuery') : searchAppend = category; 
        $('input.request').val(searchAppend)
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          response.data.forEach(listing => {
            $("#listings-column")
              .append(`<div
              style="margin-bottom: 1rem; background: #f8f8f8"
              class="ui grid segment listingItem-search"
              id="list-item"
            >
              <div style="padding: 1rem; padding-right: 0px;" class="row">
                <div  class="five wide middle aligned column">
                  <div class="ui image" >
                      <img 
                      style="max-height: 200px;"
                      class="ui rounded fluid image"
                      src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image || "placeholder.png"}"
                    />
                  </div>
                </div>
                <div class="eleven wide column">
                  <div class="ui grid">
                      <div
                      style="padding: 1rem 0rem 0rem .5rem;"
                      class="ten wide column"
                    >
                      <a href="#" id="${listing.id}" class="listingTitle-search">
                        ${listing.business_title} <i class="tiny check circle icon" style="color: #1f7a8c;" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || "" }
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #79bcb8; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div id="listing-tagline-search" class="fourteen wide column">
                      ${listing.tagline} 
                  </div>
                  </div>
                  </div>
                </div>
            </div>`);
          });
          
          response.data.forEach(item => {
            markerInfo.push(item);
          });
        if (sessionStorage.getItem('location')) {
          $('#location').attr('placeholder', sessionStorage.getItem('location'))
          drawMap(null, sessionStorage.getItem('location'))
        } else {
          drawMap(location)
        }
          
        }
      })
      .catch(err => {
        console.log(err);
      });
  } else if ( logoSearch ) {

    console.log(logoSearch)
    myAxios
      .get(
        API_URL +
          "search/logo/" +
          logoSearch +
          "/" +
          location.coords.latitude + "+" + location.coords.longitude + '/' + distance
      )
      .then(response => {
        allListings = response.data
        let searchAppend = ''
        sessionStorage.getItem('logoSearch') ? searchAppend = sessionStorage.getItem('logoSearch') : searchAppend = search
        $('input.request').val(searchAppend)
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${searchAppend}" in your area.`
          );
          $(loader).fadeOut();
          $(page).fadeIn();
          if (sessionStorage.getItem('location')) {
            $('#location').attr('placeholder', sessionStorage.getItem('location'))
            drawMap(null, sessionStorage.getItem('location'))
          } else {
            drawMap(location)
          }
        } else {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          response.data.forEach(listing => {
            $("#listings-column")
              .append(`<div
              style="margin-bottom: 1rem; background: #f8f8f8"
              class="ui grid segment listingItem-search"
              id="list-item"
            >
              <div style="padding: 1rem; padding-right: 0px;" class="row">
                <div  class="five wide middle aligned column">
                  <div class="ui image" >
                      <img
                      class="ui rounded image"
                      src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image || "placeholder.png"}"
                    />
                  </div>
                </div>
                <div class="eleven wide column">
                  <div class="ui grid">
                      <div
                      style="padding: 1rem 0rem 0rem .5rem;"
                      class="ten wide column"
                    >
                      <a href="#"  id="${listing.id}" class="listingTitle-search">
                        ${listing.business_title} <i class="small check circle icon" style="color: #1f7a8c;" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || "" }
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #1f7a8c; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div class="fourteen wide column">
                    <p style="margin-top: 1rem;" id="listing-tagline-search">
                      ${listing.tagline} 
                    </p>
                  </div>
                  </div>
                  </div>
                </div>
            </div>`);
          });
          
          response.data.forEach(item => {
            markerInfo.push(item);
          });
          if (sessionStorage.getItem('location')) {
            $('#location').attr('placeholder', sessionStorage.getItem('location'))
            drawMap(null, sessionStorage.getItem('location'))
          } else {
            drawMap(location)
          }
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    let newSearch = category.replace(/\//g, '+');
    console.log(newSearch)
    myAxios
      .get(
        API_URL +
          "search/category/" +
          newSearch +
          "/" +
          location.coords.latitude + "+" + location.coords.longitude + '/' + distance
      )
      .then(response => {
        allListings = response.data
        let searchAppend = ''
        !category ? searchAppend = sessionStorage.getItem('logoSearch') : searchAppend = search
        $('input.request').val(searchAppend)
        console.log(response)
        console.log(search)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${searchAppend}" in your area.`
          );
          $(loader).fadeOut();
          $(page).fadeIn();
          if (sessionStorage.getItem('location')) {
            $('#location').attr('placeholder', sessionStorage.getItem('location'))
            drawMap(null, sessionStorage.getItem('location'))
          } else {
            drawMap(location)
          }
        } else {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${searchAppend}"</p>`)
          response.data.forEach(listing => {
            $("#listings-column")
              .append(`<div
              style="margin-bottom: 1rem; background: #f8f8f8"
              class="ui grid segment listingItem-search"
              id="list-item"
            >
              <div style="padding: 1rem; padding-right: 0px;" class="row">
                <div  class="five wide middle aligned column">
                  <div class="ui image" >
                      <img
                      class="ui rounded image"
                      src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image || "placeholder.png"}"
                    />
                  </div>
                </div>
                <div class="eleven wide column">
                  <div class="ui grid">
                      <div
                      style="padding: 1rem 0rem 0rem .5rem;"
                      class="ten wide column"
                    >
                      <a href="#"  id="${listing.id}" class="listingTitle-search">
                        ${listing.business_title} <i class="small check circle icon" style="color: #1f7a8c;" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || "" }
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #1f7a8c; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div class="fourteen wide column">
                    <p style="margin-top: 1rem;" id="listing-tagline-search">
                      ${listing.tagline} 
                    </p>
                  </div>
                  </div>
                  </div>
                </div>
            </div>`);
          });
          
          response.data.forEach(item => {
            markerInfo.push(item);
          });
          if (sessionStorage.getItem('location')) {
            $('#location').attr('placeholder', sessionStorage.getItem('location'))
            drawMap(null, sessionStorage.getItem('location'))
          } else {
            drawMap(location)
          }
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

searchListings()

  if (authHelper.isLoggedIn()) {
    const token = sessionStorage.getItem("token");
    const userInfo = authHelper.parseToken(token);
    console.log(userInfo);
    if (userInfo && userInfo.isClientUser) {
      $("#register-column").html(`
      <div id="client-drop-div">
        <div id="client-dropdown" class="ui inline dropdown">
          <div id="dropdown-text" class="text">
          ${userInfo.email}
        </div>
        <i id="dropdown-icon" class="dropdown icon"></i>
        <div class="menu">
        <div id="saved-listings-option" class="item">
        <p class="user-menu-option-text" ><i class="bookmark icon" ></i> Bookmarked Listings</p>
      </div>
      <div id="logout-menu-option" class="item">
        <p class="user-menu-option-text" ><i class="power off icon" ></i> Logout</p>
      </div>
          </div>
        </div>
      </div>
      `);
      $(".ui.dropdown").dropdown({ transition: "drop" });
      $("#sign-in-column").html(`
      <div style="background: #696969; border-bottom: solid; border-color: #696969; border-width: 5px;" id="listBusiness-button">
      <p style="color: white;" class="top-button listBusClick" id="register"><i class="store icon" ></i>List Your Business</p>
      </div>
      `);
    } else if (userInfo && userInfo.isProfessionalUser) {
      $("#register-column").html(`
      <div id="client-drop-div">
        <div id="client-dropdown" class="ui inline dropdown">
          <div id="dropdown-text" class="text">
          ${userInfo.email}
        </div>
        <i id="dropdown-icon" class="dropdown icon"></i>
        <div class="menu">
            <div id="dashboard-menu-option" class="item">
              <p class="user-menu-option-text" ><i class="building icon" ></i> Dashboard</p>
            </div>
            <div id="saved-listings-option" class="item">
              <p class="user-menu-option-text" ><i class="bookmark icon" ></i> Bookmarked Listings</p>
            </div>
            <div id="logout-menu-option" class="item">
              <p class="user-menu-option-text" ><i class="power off icon" ></i> Logout</p>
            </div>
          </div>
        </div>
      </div>
      `);
      $(".ui.dropdown").dropdown({ transition: "drop" });
      $("#sign-in-column").html("");
    } else if (userInfo && userInfo.isAdminUser) {
      $("#register-column").html(`
      <div id="client-drop-div">
        <div id="client-dropdown" class="ui inline dropdown">
          <div id="dropdown-text" class="text">
          ${userInfo.email}
        </div>
        <i id="dropdown-icon" class="dropdown icon"></i>
        <div class="menu">
            <div id="admin-menu-option" class="item">
              <p class="user-menu-option-text" ><i class="chart pie icon" ></i> Admin Portal</p>
            </div>
            <div id="dashboard-menu-option" class="item">
              <p class="user-menu-option-text" ><i class="building icon" ></i> Dashboard</p>
            </div>
            <div id="saved-listings-option" class="item">
              <p class="user-menu-option-text" ><i class="bookmark icon" ></i> Bookmarked Listings</p>
            </div>
            <div id="logout-menu-option" class="item">
              <p class="user-menu-option-text" ><i class="power off icon" ></i> Logout</p>
            </div>
          </div>
        </div>
      </div>
      `);
      $(".ui.dropdown").dropdown({ transition: "drop" });
      $("#sign-in-column").html("");
    }
    } else {
    console.log("not logged in");
    $("#logout-button").css("display", "none");
  }

  $("body").on("click", "#admin-menu-option", function() {
    event.preventDefault();
    
    if (authHelper.isLoggedIn__admin()) {
      sessionStorage.setItem("lastLocation", "index");
      window.location.assign("admin.portal.html");
    } else {
      alert('You must Have a verified business to view this page')
    }
  });

  $("body").on("click", "#dashboard-menu-option", function() {
    event.preventDefault();
    
    if (authHelper.isLoggedIn__professional()) {
      sessionStorage.setItem("lastLocation", "index");
      window.location.assign("dashboard.html");
    } else {
      alert('You must Have a verified business to view this page')
    }
  });

  $("body").on("click", "#saved-listings-option", function() {
    sessionStorage.setItem("lastLocation", "index");
    window.location.assign("saved.listings.html");
  });

  $("body").on("click", "#admin-portal-button", function() {
    sessionStorage.setItem("lastLocation", "index");
    window.location.assign("admin.portal.html");
  });

  $("body").on("click", "#logout-menu-option", function() {
    event.preventDefault();
    authHelper.logOut();
    $("#register-column").html(
      `<div
      id="listBusiness-button"
    >
      <p style="background: #696969; color: white;" class="top-button listBusClick" id="register">
        <i class="store icon"></i>List Your Business
      </p>
    </div>`
    );
    $("#sign-in-column").html(
      `<div id="sign-in-button"><p id="sign-in">Sign In</p></div>`
    );
    $("#dashboard-column").html("");
    $("#logout-div").html("");
  });

  $("body").on("click", ".listBusClick", function() {
    console.log("list business");
    sessionStorage.setItem("lastLocation", "search");
    if (authHelper.isLoggedIn()) {
      window.location.assign("billing__new.html");
    } else {
      sessionStorage.setItem("routeToBilling", true);
      window.location.assign("sign-in.html");
    }
  });


  $("body").on("click", "#sign-in-button", function() {
    event.preventDefault();

    sessionStorage.setItem('lastLocation', 'index')
    window.location.assign("sign-in.html");
  });

  $("body").on("click", ".saveButton", function(e) {
    const id = $(this).attr("id");
    const token = sessionStorage.getItem("token");
    console.log($(this));
    if (token) {
      myAxios
        .post(API_URL + "saveListing/" + id, { token: token })
        .then(response => {
          console.log(response);
          $(this).css("background", "green");
          $(this).textContent = "Saved";
        });
    } else {
      alert("please sign in to save listings");
      sessionStorage.setItem('lastLocation', 'search')

      window.location.assign("sign-in.html");
    }
  });

  function viewListing() {
    const id = $(this).attr("id");

    sessionStorage.setItem("currentListing", id);
    // window.location.assign("listing.html");
  }

  // $("body").on("click", ".listingTitle--search", function(e) {
  //   const id = $(this).attr("id");

  //   sessionStorage.setItem("currentListing", id);
  //   window.location.assign("listing.html");
  // });

  $("body").on("click", "#logout-menu-option", function() {
    event.preventDefault();
    authHelper.logOut();
    $("#register-column").html(
      `<div
      id="listBusiness-button"
    >
      <p style="background: #696969; color: white;" class="top-button listBusClick" id="register">
        <i class="store icon"></i>List Your Business
      </p>
    </div>`
    );
    $("#sign-in-column").html(
      `<div id="sign-in-button"><p id="sign-in">Sign In</p></div>`
    );
    $("#dashboard-column").html("");
    $("#logout-div").html("");
  });

  $("body").on("click", "#back-button", function() {

    sessionStorage.setItem('lastLocation', 'search')
    if (sessionStorage.getItem('lastLocation') === 'sign-in' ) {
      window.location.assign('index.html')
    } else if (sessionStorage.getItem('lastLocation') === 'search' ) {
      window.location.assign('index.html')
    } else {
      window.history.back()
    }
  });

  $("body").on("click", "#dashboard-menu-option", function() {
    event.preventDefault();
    
    if (authHelper.isLoggedIn__professional()) {
      sessionStorage.setItem("lastLocation", "index");
      window.location.assign("dashboard.html");
    } else {
      alert('You must Have a verified business to view this page')
    }
  });

  $("body").on("click", "a.listingTitle-search", function(e) {
    const id = $(this).attr("id");
    // filter arr of all listings on page to find clicked on listing and get the id
    let getCoords = allListings.filter(x => x.id === id); 
    // set the last window location to search 
    sessionStorage.setItem('lastLocation', 'search')
    // set the current listing lat and lng in SS
    sessionStorage.setItem('listing-lat', getCoords[0].lat)
    sessionStorage.setItem('listing-lng', getCoords[0].lng)
    // set full address for if no coords 
    sessionStorage.setItem('listing-address', getCoords[0].full_address)
    sessionStorage.setItem("currentListing", id);
    window.location.assign("listing.html");
  });


});
