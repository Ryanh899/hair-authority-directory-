
const API_URL = 'http://localhost:3000/api/' 

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
    }
    else {
        return Promise.reject(error)
    } 
})
var authHelper = {
    isLoggedIn () {
        const token = localStorage.getItem('token')
        if(token) {
            var userData = this.parseToken(token);
            var expirationDate = new Date(userData.exp * 1000)
            if(Date.now() > expirationDate) this.logOut()
            return true 
        } else { 
            return false
        }
    },
    parseToken (token) {
        return JSON.parse(window.atob(token.split('.')[1]))
    },
    logOut (path = './sign-in.html') {
        localStorage.removeItem('token')
        window.location.assign(path)
    }
}

$( document ).ready(function() {
    // style js 
    $('.vertical.menu .item').tab();

    $('body').on('click', '#listings-tab', function() {
        myAxios.get(API_URL + 'listings', {
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              }, 
            body: JSON.stringify(authHelper.parseToken(localStorage.getItem('token')))
        }).then(res => res.json())
        .then(response => {
            console.log(response); 
            if (response.length === 0) {
                $( '#listings-div' ).html(`<h1 class="h1" >You have no listings</h1>
                                           <h2 class="h2">But you could... </h2>
                                           <button id="add-listing-button" class="ui button">Make a listing</button>`); 
            } else {
                console.log('wtf')
            }
        })
        .catch(err => console.log(err)); 
      });

      $('body').on('click', '#add-listing-button', function() {
        window.location.assign('listing.form.html'); 
      })
    
    
});
  
  