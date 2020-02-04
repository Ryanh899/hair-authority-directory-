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

$(document).ready(function() {
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
    window.location.assign('search.listings.html')
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
});
