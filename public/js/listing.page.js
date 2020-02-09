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
      const page = document.querySelector('div#page-container')
      const loader = document.querySelector('div#loader-div')

      $(page).css('dislplay', 'none')

      const currentLocation = {
          lat: sessionStorage.getItem('lat'), 
          lng: sessionStorage.getItem('lng')
      }

      const currentListing = sessionStorage.getItem('currentListing')

      

      if (currentListing && currentLocation) {
          myAxios.get(API_URL + 'listing/' + currentListing)
            .then(response => {
                $(loader).css('display', 'none')
                $(page).css('display', '')
                console.log(response)
            })
            .catch(err => {
                console.log(err)
            })
      }

  })