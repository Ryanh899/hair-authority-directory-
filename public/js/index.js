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

const API_URL = 'http://localhost:3000/api/'

$(document).ready(function() {
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

  // gets location and sets in session storage
  if (!sessionStorage.getItem('lat') || !sessionStorage.getItem('lat')) {
    getLocation()
  }

  if (authHelper.isLoggedIn()) {
    const token = localStorage.getItem("token");
    const userInfo = authHelper.parseToken(token);
    console.log(userInfo)
    if (userInfo && userInfo.isClientUser) {
      $("#auth-buttons").html(
        `<button id="saved-listings" class="ui button" >My Listings</button>`
      );
    } else if (userInfo && userInfo.isProfessionalUser) {
      $("#auth-buttons").html(
        `<button id="dashboard-button" class="ui button" >My Dashboard</button>`
      );
    } else if (userInfo && userInfo.isAdminUser) {
      $("#auth-buttons").html(
        `<button id="admin-portal-button" class="ui button" >Admin Portal</button>`
      );
    }
  } else {
    console.log("not logged in");
    $( '#logout-button' ).css('display', 'none')
  }
  $('body').on('click', '#sign-in-button', function() {
    event.preventDefault();
    window.location.assign("sign-in.html");
  });

  $('body').on('click', '#register-button', function() {
    event.preventDefault();
    window.location.assign("register.html");
  });

  $('body').on('click', '#dashboard-button', function() {
    event.preventDefault();
    window.location.assign("dashboard.html");
  });

  $('body').on('click', '#saved-listings', function () {
    window.location.assign('saved.listings.html')
})

  $('body').on('click', '#logout-button', function() {
    event.preventDefault();
    authHelper.logOut()
    $("#auth-buttons").html(
        `<button id="sign-in-button" class="ui button" >Sign In</button>
        <button id="register-button" class="ui button">Register</button>`
      );
    $( '#logout-div' ).html('')
  });

  const categories = [
    {title: "Dermatologist"},
    {title: "Hair Care Salons"},
    {title: "Hair Loss / Hair Care Products & Treatments"},
    {title: "Hair Replacement & Hair Systems"},
    {title: "Laser Therapy"},
    {title: "Medial / Hair Transplants"},
    {title: "Trichologist"},
    {title: "Wigs, Extensions, Hair Additions"}, 
    {title: "The Hair Club", abbreviation: ""}, 
    {title: "ARTAS Robotic Hair Restoration System"}, 
    {title: "World Trichology Society", abbreviation: 'WTS'}, 
    {title: "The International Society of Hair Restoration Surgery (ISHRS)", abbreviation: "ISHRS"}
  ];

  $('.ui.search')
  .search({
    source : categories,
    searchFields   : [
      'title', 
      'abbreviation'
    ],
    fullTextSearch: false, 
    showNoResults: false
  });

  


  $('body').on('click', '#search-button', function() {
    const search = document.querySelector('input#search-semantic').value.trim()
    console.log(search)

    sessionStorage.setItem('searchQuery', search)
    window.location.assign('search.listings.html')

  })

});
