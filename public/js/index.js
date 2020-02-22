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

  // gets location and sets in session storage
  if (!sessionStorage.getItem("lat") || !sessionStorage.getItem("lat")) {
    getLocation();
  }

  if (authHelper.isLoggedIn()) {
    const token = localStorage.getItem("token");
    const userInfo = authHelper.parseToken(token);
    console.log(userInfo);
    if (userInfo && userInfo.isClientUser) {
      $("#register-column").html(
        `<div id="logout-button"><p class="top-button" id="register">Logout</p></div>`
      );
      $("#sign-in-column").html(
        `<div id="saved-listings"><p class="top-button" id="sign-in">My Listings</p></div>`
      );
      $("#dashboard-column").html(`
      <div style="background: #8b786d; border-bottom: solid; border-color: #8b786d; border-width: 5px;" id="listBusiness-button">
      <p style="color: white;" class="top-button" id="register"><i class="store icon" ></i>List Your Business</p>
    </div>
      `);
    } else if (userInfo && userInfo.isProfessionalUser) {
      $("#register-column").html(
        `<div id="logout-button"><p class="top-button" id="register">Logout</p></div>`
      );
      $("#sign-in-column").html(
        `<div id="saved-listings"><p class="top-button" id="sign-in">My Listings</p></div>`
      );
      $("#dashboard-column").html(`
      <div id="dashboard-button"  ><p class="top-button" id="dashboard" >Dashboard</p></div>
      `);
    } else if (userInfo && userInfo.isAdminUser) {
      $("#register-column").html(
        `<div id="logout-button"><p class="top-button" id="register">Logout</p></div>`
      );
      $("#sign-in-column").html(
        `<div id="saved-listings"><p class="top-button" id="sign-in">My Listings</p></div>`
      );
      $("#dashboard-column").html(`
      <div id="dashboard-button"  ><p class="top-button" id="dashboard" >Dashboard</p></div>
      `);
    }
  } else {
    console.log("not logged in");
    $("#logout-button").css("display", "none");
  }
  $("body").on("click", "#sign-in-button", function() {
    event.preventDefault();
    window.location.assign("sign-in.html");
  });

  $("body").on("click", "#listBusiness-button", function() {
    event.preventDefault();
    if (authHelper.isLoggedIn()) {
      window.location.assign("listing.form.html");
    } else {
      window.location.assign("sign-in.html");
    }
  });

  $("body").on("click", "#dashboard-button", function() {
    event.preventDefault();
    window.location.assign("dashboard.html");
  });

  $("body").on("click", "#saved-listings", function() {
    window.location.assign("saved.listings.html");
  });

  $("body").on("click", "#admin-portal-button", function() {
    window.location.assign("admin.portal.html");
  });

  $("body").on("click", "#logout-button", function() {
    event.preventDefault();
    authHelper.logOut();
    $("#register-column").html(
      `<div style="border-bottom: solid; border-color: #8b786d; border-width: 5px;" id="listBusiness-button">
      <p style="color: white;" class="top-button" id="register"><i class="store icon" ></i>List Your Business</p>
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

  $(".ui.search").search({
    source: categories,
    searchFields: ["title", "abbreviation"],
    fullTextSearch: false,
    showNoResults: false
  });

  $("body").on("click", "#search-button", function() {
    const search = document.querySelector("input#search-semantic").value.trim();
    console.log(search);

    sessionStorage.setItem("searchQuery", search);
    window.location.assign("search.listings.html");
  });

  $("body").on("click", "#list-business-button", function() {
    const user = localStorage.getItem("token");

    if (user) {
      window.location.assign("listing.form.html");
    } else {
      alert("please log in to make a listing");
      window.location.assign("sign-in.html");
    }
  });

  $("body").on("click", "#landing-list-a", function() {
    window.location.assign("listing.form.html");
  });
});
