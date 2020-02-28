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
    Authorization: "Bearer " + localStorage.getItem("token")
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
    return JSON.parse(window.atob(token.split(".")[1]));
  },
  logOut(path = "./sign-in.html") {
    localStorage.removeItem("token");
    window.location.assign(path);
  }
};

const API_URL = "http://localhost:3000/api/";

$(document).ready(function() {
  let markerInfo = [];
  const page = document.querySelector("div#page-container");
  const loader = document.querySelector("div#loader-div");

  $(page).css("display", "none");

  function getGeolocation() {
    navigator.geolocation.getCurrentPosition(drawMap);
  }

  function drawMap(geoPos) {
    geolocate = new google.maps.LatLng(
      geoPos.coords.latitude,
      geoPos.coords.longitude
    );
    let mapProp = {
      center: geolocate,
      zoom: 9, 
      disableDefaultUI: true,
      zoomControl: true
    };
    let map = new google.maps.Map(document.getElementById("map"), mapProp);
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
    { title: "World Trichology Society", abbreviation: "WTS" },
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
    window.location.assign("index.html");
  });

  $("body").on("click", "#search-button", function() {
    const search = document.querySelector("input#search-search").value.trim();
    console.log(search);

    sessionStorage.setItem("searchQuery", search);
    window.location.assign("search.listings.html");
  });

  $("body").on("click", "#home-button", function() {
    window.location.assign("index.html");
  });

  let search = sessionStorage.getItem("searchQuery");

  let category = "";

  // check if it is a category
  categories.forEach(item => {
    if (item.title === search) {
      category = search;
    }
  });

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

  let allListings = []; 
  if (category === "") {
    myAxios
      .get(
        API_URL + "search/" + search + "/" + location.lat + "+" + location.lng
      )
      .then(response => {
        allListings = response.data
        console.log(response);
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(loader).fadeOut();
          $(page).fadeIn();
          getGeolocation();
        } else {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
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
                        ${listing.business_title} <i class="tiny check circle icon" style="color: #79bcb8" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || "" }
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #79bcb8;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #79bcb8;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #79bcb8; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div class="fourteen wide column">
                    <p style="margin-top: 1rem;" id="listing-tagline-search">
                      ${listing.business_description} 
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

          getGeolocation();
        }
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
          location.lat +
          "+" +
          location.lng
      )
      .then(response => {
        allListings = response.data
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(loader).fadeOut();
          $(page).fadeIn();
          getGeolocation();
        } else {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
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
                        ${listing.business_title} <i class="small check circle icon" style="color: #79bcb8" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || "" }
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #79bcb8;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #79bcb8;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #79bcb8; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div class="fourteen wide column">
                    <p style="margin-top: 1rem;" id="listing-tagline-search">
                      ${listing.business_description} 
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
          getGeolocation();
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  }

  $("body").on("click", ".saveButton", function(e) {
    const id = $(this).attr("id");
    const token = localStorage.getItem("token");
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

  $("body").on("click", "a", function(e) {
    const id = $(this).attr("id");
    console.log(allListings)
    let getCoords = allListings.filter(x => x.id === id); 
    console.log(getCoords)
    sessionStorage.setItem('listing-lat', getCoords[0].lat)
    sessionStorage.setItem('listing-lng', getCoords[0].lng)
    sessionStorage.setItem('listing-address', getCoords[0].full_address)
    sessionStorage.setItem("currentListing", id);
    window.location.assign("listing.html");
  });

});
