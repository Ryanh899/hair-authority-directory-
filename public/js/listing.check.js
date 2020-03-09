// auth helper and axios interceptor 
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
          return false;
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
    }, 
    zohoRedirectCheck () {
      const url = window.location.href.split('='); 
      const redirectId = url[1]; 
      if (redirectId) {
        return redirectId
      } else {
        return false
      }
    }
  };

// on ready
$(document).ready(function () {

    // establish api url 
    // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
     let API_URL = "http://localhost:3000/api/";

    // add event listener for search button
    $('body').on('click', '#check-search', function () {
        // start loader + hide page

        // assign var to search input
        const search = $('#check-search-input').val().trim(); 
        console.log(search)
        if (search) {
            myAxios
                .get(API_URL + 'listing/title/' + search)
                .then(resp => {
                    console.log(resp); 
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            return alert('Invalid Entry')
           
        }
       
    })
})