var authHelper = {
    isLoggedIn() {
      const token = sessionStorage.getItem("token");
      console.log(token)
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

$(document).ready(function () {
console.log(authHelper.isLoggedIn())
console.log(sessionStorage.getItem('token'))
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

    // sessionStorage.setItem("lastLocation", "index");
    window.location.assign("sign-in.html");
  });

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
})

