const categories = [{
    title: "Dermatologist"
  },
  {
    title: "Hair Care Salons"
  },
  {
    title: "Hair Loss + Hair Care Products & Treatments"
  },
  {
    title: "Hair Replacement & Hair Systems"
  },
  {
    title: "Laser Therapy"
  },
  {
    title: "Medial + Hair Transplants"
  },
  {
    title: "Trichologist"
  },
  {
    title: "Wigs, Extensions, Hair Additions"
  },
  {
    title: "The Hair Club",
    abbreviation: ""
  },
  {
    title: "ARTAS Robotic Hair Restoration System"
  },
  {
    title: "World Trichology Society",
    abbreviation: "WTS"
  },
  {
    title: "The International Society of Hair Restoration Surgery (ISHRS)",
    abbreviation: "ISHRS"
  }
];


var myAxios = axios.create({
  headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
});
myAxios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.status === 401) {
      return authHelper.logOut('./sign-in.html')
  } else {
      return Promise.reject(error)
  }
})
var authHelper = {
  isLoggedIn() {
      const token = localStorage.getItem('token')
      if (token) {
          var userData = this.parseToken(token);
          var expirationDate = new Date(userData.exp * 1000)
          if (Date.now() > expirationDate) this.logOut()
          return true
      } else {
          return false
      }
  },
  parseToken(token) {
      return JSON.parse(window.atob(token.split('.')[1]))
  },
  logOut(path = './sign-in.html') {
      localStorage.removeItem('token')
      window.location.assign(path)
  }
}

const API_URL = "http://localhost:3000/api/";

$(document).ready(function () {
  let markerInfo = [];

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
    if (markerInfo.length > 0) {
      markerInfo.forEach(item => {
        let marker = new google.maps.Marker({
          position: {
            lat: Number(item.lat),
            lng: Number(item.lng)
          },
          map: map,
          title: 'Hello World!'
        })
      })
    }


  }

  getLocation();

  $("body").on("click", "#home-button", function () {
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
    sessionStorage.setItem('lat', position.coords.latitude)
    sessionStorage.setItem('lng', position.coords.longitude)
  }

  let location = {
    lat: sessionStorage.getItem('lat'),
    lng: sessionStorage.getItem('lng')
  }

  if (category === "") {
    myAxios
      .get(API_URL + "search/" + search + "/" + location.lat + '+' + location.lng)
      .then(response => {
        response.data.forEach(listing => {
          $("#listings-column")
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
                  <a id="${listing.id}" class="editButton">
                    <div style="color: white;" class="listing-buttons " id="${listing.id}">
                      <i style="pointer-events:none" class="eye icon"></i> View
                    </div>
                  </a>
                  <a id="${listing.id}" class="editButton">
                    <div style="color: white;" class="listing-buttons ">
                      <i style="pointer-events:none" style="color: red;" class="save icon"></i>
                      Save
                    </div>
                  </a>
                </div>
              </div>
            </div>`);
        });
        response.data.forEach(item => {
          markerInfo.push(item)
        })
        getGeolocation()
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    myAxios
      .get(API_URL + "search/category/" + search.split(' ').join('+') + '/' + location.lat + '+' + location.lng)
      .then(response => {
        response.data.forEach(listing => {
          $("#listings-column")
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
                <a id="${listing.id}" class="editButton">
                  <div style="color: white;" class="listing-buttons " id="${listing.id}">
                    <i style="pointer-events:none" class="eye icon"></i> View
                  </div>
                </a>
                <a id="${listing.id}" class="editButton">
                  <div style="color: white;" class="listing-buttons ">
                    <i style="pointer-events:none" style="color: red;" class="save icon"></i>
                    Save
                  </div>
                </a>
              </div>
            </div>
          </div>`);
        });
        response.data.forEach(item => {
          markerInfo.push(item)
        })
        getGeolocation()
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  }
});