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
    if (error.response.status === 401) {
      return authHelper.logOut("./sign-in.html");
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
      if (Date.now() > expirationDate) this.logOut();
      return true;
    } else {
      return false;
    }
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
  parseToken(token) {
    if (token) {
      return JSON.parse(window.atob(token.split(".")[1]));
    }
  },
  logOut() {
    sessionStorage.removeItem("token");
  }
};

function scrollToAnchor(id){
  var div = $(`div#${id}`);
  $('html,body').animate({scrollTop: div.offset().top},'slow');
}

// let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
let API_URL = "http://localhost:3000/api/";





$(document).ready(function() {
 
const loader = document.querySelector('div#home-loader')
$(loader).show()

  // $('body').on('click', 'a#about', function (e) {
  //   e.preventDefault()
  //   scrollToAnchor('why-section')
  // })

  let geocoder; 

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
         console.log('else')
         resolve() 
       }
     } else {
      console.log('else')
      
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
    sessionStorage.setItem("current-lat", position.coords.latitude);
    sessionStorage.setItem("current-lng", position.coords.longitude);
    const currentAddress = await getCity(position.coords.latitude, position.coords.longitude); 
    console.log('current address: ' + currentAddress)
    console.log(currentAddress)
    $('#location').attr('placeholder', currentAddress); 
    $(loader).hide()
  } else {

    const currentAddress = await changeLocation(city); 

    sessionStorage.setItem("current-lat", currentAddress.geometry.location.lat());
    sessionStorage.setItem("current-lng", currentAddress.geometry.location.lng());

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
    sessionStorage.removeItem('plan'); 
    // sessionStorage.removeItem('currentListing'); 
    sessionStorage.removeItem('subscription_id'); 
    sessionStorage.removeItem('customer_id'); 
    // sessionStorage.removeItem('listing-lat'); 
    // sessionStorage.removeItem('listing-lng'); 
    // sessionStorage.removeItem('listing-address'); 
    sessionStorage.removeItem('logoSearch'); 
    $("#logout-button").css("display", "none");
  }

  $("body").on("click", "#sign-in-button", function() {
    event.preventDefault();

    sessionStorage.setItem("lastLocation", "index");
    window.location.assign("sign-in.html");
  });

  // $("body").on("click", "#listBusiness-button", function() {
  //   event.preventDefault();
  //   if (authHelper.isLoggedIn()) {
  //     window.location.assign('billing.html')
  //   } else {
  //     window.location.assign("sign-in.html");
  //   }
  // });

  $("body").on("click", ".listBusClick", function() {
    console.log("list business");
    sessionStorage.setItem("lastLocation", "index");
    if (authHelper.isLoggedIn()) {
      window.location.assign("billing__new.html");
    } else {
      sessionStorage.setItem("routeToBilling", true);
      window.location.assign("sign-in.html");
    }
  });

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

  const categories = [
    { title: "Dermatologist" },
    { title: "Hair Care Salons" },
    { title: "Hair Loss / Hair Care Products & Treatments" },
    { title: "Hair Replacement & Hair Systems" },
    { title: "Laser Therapy" },
    { title: "Medical / Hair Transplants" },
    { title: "Trichologist" },
    { title: "Medical Hair Restoration" },
    { title: "Wigs / Extensions & Hair Additions" }
  ];
  let catButtonDiv = document.createElement("div");
  catButtonDiv.className = "computer only";
  catButtonDiv.id = "append-cat-buttons";
  catButtonDiv.style.textAlign = 'center'
  let or = document.createElement("p");
  or.id = "or-text";
  or.style.marginTop = "1rem";
  or.style.color = "white";
  or.style.textAlign = "center";
  or.innerHTML = "<i class='small down arrow icon' ></i>Or click on a category button to search <i class='small down arrow icon' ></i> ";
  catButtonDiv.appendChild(or);
  $("#search-appendButtons").append(catButtonDiv);
  categories.forEach(category => {
    let button = document.createElement("button");
    button.className = "ui button catButtons";
    button.textContent = category.title;
    button.style.margin = ".5rem";
    button.style.color = "#1F7A8C";
    button.style.background = "white";
    button.style.fontFamily = "Lato";
    button.style.fontWeight = 500;
    $("#append-cat-buttons").append(button);
  });

  $(".ui.search").search({
    source: categories,
    searchFields: ["title", "abbreviation"],
    fullTextSearch: false,
    showNoResults: false
  });

  $("body").on("click", "a#search-button", async function() {
    $(loader).show()
    const search = document.querySelector("input#request").value.trim();
    const location = document.querySelector('input#location').value.trim(); 
    console.log($('input#request').val())
    console.log(search)
    console.log($('input#location').val())

    if (location !== '') {
      await showPosition(null, location); 
      sessionStorage.setItem('location', location)
    }
    sessionStorage.setItem("lastLocation", "index");
    sessionStorage.setItem("searchQuery", search);
    window.location.assign("search.listings.html");
  });

  $("body").on("click", "#list-business-button", function() {
    const user = sessionStorage.getItem("token");
    sessionStorage.setItem("lastLocation", "index");

    if (user) {
      window.location.assign("listing.form.html");
    } else {
      alert("please log in to make a listing");
      sessionStorage.setItem("addListing", true);
      window.location.assign("sign-in.html");
    }
  });

  $("body").on("click", "#landing-list-a", function() {
    sessionStorage.setItem("lastLocation", "index");
    window.location.assign("listing.form.html");
  });

  $("body").on("click", "#step1-search", function() {
    $(window).scrollTop(0);
    $("#search-semantic").focus();
  });

  $("body").on("click", ".catButtons", function(e) {
    const search = $(e.target).text();
    console.log(search);

    sessionStorage.setItem("lastLocation", "index");
    sessionStorage.setItem("searchQuery", search);
    window.location.assign("search.listings.html");
  });

  // enter button search functionality
  $("body").keyup(function(event) {
    console.log("pressed");
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      if ($("#search-semantic").val()) {
        $("#search-button").click();
      } else {
        return;
      }
    }
  });

  // fade ins and outs for logo text
  $("body").on("click", "#ishrs-expand", function() {
    $("#artas-grid").fadeOut(350);
    $("#wts-grid").fadeOut(350);
    $("#club-grid").fadeOut(350);
    $("#ishrs-grid").fadeOut(500, () => {
      $("#ishrs-hide").css("display", "");
      $(this).css("display", "none");
      $("#ishrs-truncate").addClass("truncated");
      $("#ishrs-grid").fadeIn(500);
    });
  });

  $("body").on("click", "#ishrs-hide", function() {
    $("#artas-grid").fadeIn();
    $("#wts-grid").fadeIn();
    $("#club-grid").fadeIn();
    $("#ishrs-expand").css("display", "");
    $("#ishrs-hide").css("display", "none");
    $("#ishrs-truncate").removeClass("truncated");
  });

  $("body").on("click", "#artas-expand", function() {
    $("#ishrs-grid").fadeOut(350);
    $("#wts-grid").fadeOut(350);
    $("#club-grid").fadeOut(350);
    $("#artas-grid").fadeOut(500, () => {
      $("#artas-hide").css("display", "");
      $(this).css("display", "none");
      $("#artas-truncate").addClass("truncated");
      $("#artas-grid").fadeIn(500);
    });
  });

  $("body").on("click", "#artas-hide", function() {
    $("#ishrs-grid").fadeIn();
    $("#wts-grid").fadeIn();
    $("#club-grid").fadeIn();
    $("#artas-expand").css("display", "");
    $("#artas-hide").css("display", "none");
    $("#artas-truncate").removeClass("truncated");
  });

  $("body").on("click", "#wts-expand", function() {
    $("#ishrs-grid").fadeOut(350);
    $("#artas-grid").fadeOut(350);
    $("#club-grid").fadeOut(350);
    $("#wts-grid").fadeOut(500, () => {
      $("#wts-hide").css("display", "");
      $(this).css("display", "none");
      $("#wts-truncate").addClass("truncated");
      $("#wts-grid").fadeIn(500);
    });
  });

  $("body").on("click", "#wts-hide", function() {
    $("#artas-grid").fadeIn();
    $("#ishrs-grid").fadeIn();
    $("#club-grid").fadeIn();
    $("#wts-expand").css("display", "");
    $("#wts-hide").css("display", "none");
    $("#wts-truncate").removeClass("truncated");
  });

  $("body").on("click", "#club-expand", function() {
    $("#ishrs-grid").fadeOut(350);
    $("#artas-grid").fadeOut(350);
    $("#wts-grid").fadeOut(350);
    $("#club-grid").fadeOut(500, () => {
      $("#club-hide").css("display", "");
      $(this).css("display", "none");
      $("#club-truncate").addClass("truncated");
      $("#club-grid").fadeIn(500);
    });
  });

  $("body").on("click", "#club-hide", function() {
    $("#artas-grid").fadeIn();
    $("#wts-grid").fadeIn();
    $("#ishrs-grid").fadeIn();
    $("#club-expand").css("display", "");
    $("#club-hide").css("display", "none");
    $("#club-truncate").removeClass("truncated");
  });

  $("body").on("click", ".logo-click", function() {
    
    console.log('clicked')
    sessionStorage.setItem("lastLocation", "index");
    sessionStorage.setItem("logoSearch", $(this).attr('id'));
    window.location.assign("search.listings.html");
  });

  // landing image carousel js
  function slick() {
    $(".landing-images").slick({
      // dots: true,
      autoplay: true,
      infinite: false,
      speed: 1000,
      arrows: false,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ]
    });
  }
  setTimeout(slick(), 200);
});
