const categories = [
  { title: "Dermatologist" },
  { title: "Hair Care Salons" },
  { title: "Hair Loss / Hair Care Products & Treatments" },
  { title: "Hair Replacement & Hair Systems" },
  { title: "Laser Therapy" },
  { title: "Medial / Hair Transplants" },
  { title: "Trichologist" },
  { title: "Wigs, Extensions, Hair Additions" },
  { title: "The Hair Club", abbreviation: "" },
  { title: "ARTAS Robotic Hair Restoration System" },
  { title: "World Trichology Society", abbreviation: "WTS" },
  {
    title: "The International Society of Hair Restoration Surgery (ISHRS)",
    abbreviation: "ISHRS"
  }
];

const API_URL = "http://localhost:3000/api/";

$(document).ready(function() {

   getLocation();

  $("body").on("click", "#home-button", function() {
    window.location.assign("index.html");
  });

  let search = sessionStorage.getItem("searchQuery");

  let category = "";

  // check if it is a category
  categories.forEach(item => {
    if (item.title === search) {
      category = search;
      // axios get by category or logo
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

  if (category === "") {
      let location = {
          lat: sessionStorage.getItem('lat'), 
          lng: sessionStorage.getItem('lng')
      }
    axios
      .get(API_URL + "search/" + search + "/" + location.lat + '+' + location.lng)
      .then(response => {
        console.log(response.data);
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
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    axios
      .get(API_URL + "search/category/" + search)
      .then(response => {
        console.log(response);
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
      })
      .catch(err => {
        console.log(err);
      });
  }
});
