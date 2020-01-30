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

function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }
  
const trimForm = function(obj) {
    // gets rid of empty responses
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
      // recurse
      else if (obj[key] == "" || obj[key] == null) delete obj[key]; // delete
    });
    return obj;
  };

$(document).ready(function () {
    // style js 
    $('.vertical.menu .item').tab();
    const user = authHelper.parseToken(localStorage.getItem('token'))

    //getting inputs
    const profileForm = document.querySelector('form#profile-form')
    const firstName = document.querySelector('input#first-name')
    const lastName = document.querySelector('input#last-name')
    const email = document.querySelector('input#email-input')
    const phone = document.querySelector('input#phone-input')
    const instagram = document.querySelector('input#instagram-input')
    const facebook = document.querySelector('input#facebook-input')
    const twitter = document.querySelector('input#twitter-input')
    const linkedin = document.querySelector('input#linkedin-input')
    const youtube = document.querySelector('input#youtube-input')
    const about = document.querySelector('textarea#about-input')
    const profileName = document.querySelector('h1#name')
    const profileCategory = document.querySelector('p#category')
    const website = document.querySelector('input#website-input')

    // append name
    const name = document.createElement('p')
    name.className = 'h2'
    $(name).css('display', 'inline-block')
    $(name).css('color', 'white')
    $(name).css('font-weight', 300)
    name.textContent = user.email
    $('#nav-welcome').append(name)

        // get profile info 
        
        function getProfile() {
            myAxios.get(API_URL + 'profile/' + localStorage.getItem('token'))
                .then(resp => {
                    const user = resp.data[0]; 
                    console.log(user)
                    $(email).attr('placeholder', user.email)
                    $(firstName).attr('placeholder', user.first_name)
                    $(lastName).attr('placeholder', user.last_name)
                    $(phone).attr('placeholder', user.phone)
                    $(instagram).attr('placeholder', user.instagram)
                    $(facebook).attr('placeholder', user.facebook)
                    $(twitter).attr('placeholder', user.twitter)
                    $(linkedin).attr('placeholder', user.linkedin)
                    $(youtube).attr('placeholder', user.youtube)
                    $(about).attr('placeholder', user.about)
                    $(website).attr('placeholder', user.website)
                    profileName.textContent = `${titleCase(user.first_name)} ${titleCase(user.last_name)}`
                })
                .catch(err => {
                    console.log(err)
                })
        };
        getProfile(); 

    $('body').on('click', '#listings-tab', function () {
        myAxios.get(API_URL + 'listings/' + localStorage.getItem('token'), {
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(resp => {
                $('#listings-div').html('')
                const response = resp.data;
                if (response.length === 0) {
                    $('#listings-div').html(`<h1 class="h1" >You have no listings</h1>
                                           <h2 class="h2">But you could... </h2>
                                           <button id="add-listing-button" class="ui button">Make a listing</button>`);
                } else {
                    console.log(response)
                    $('#listings-div').html('')
                    response.forEach(listing => {
                        $('#listings-div').append(`
                        <div class="listingItem ui grid">
                            <div class="row">
                            <div class="six wide middle aligned column">
                            <p class="listingTitle">
                              ${listing.business_title}
                            </p>
                            <p class="listingSubtitle" >${listing.business_description}</p>
                            </div>
                            <div class="six wide column"></div>
                            <div class="four wide column">
                                <a id="${listing.id}" class="editButton" ><div style="color: white;" class="listing-buttons " id="${listing.id}"> <i style="pointer-events:none" class="edit icon"></i> Edit</div></a>
                                <a id="${listing.id}" class="editButton" ><div style="color: white;" class="listing-buttons "> <i style="pointer-events:none" style="color: red;" class="delete icon"></i> Delete</div></a>
                            </div>
                            </div>
                        </div>
                           `)
                    })
                    
                }
            })
            .catch(err => console.log(err));
    });

    $('body').on('click', '#add-listing-button', function () {
        window.location.assign('listing.form.html');
    })

    $('body').on('click', '#logout-button', function () {
        localStorage.removeItem('token')
        window.location.assign('index.html')
    })

    $('body').on('click', '.editButton', function (e) {
        localStorage.setItem('listingId', e.target.id)
        window.location.assign('edit.listing.html')
    })

    $('body').on('click', '.deleteButton', function () {
        alert('edit')
    })

    $('body').on('click', '#newListing', function () {
        window.location.assign('listing.form.html')
    })

    $('body').on('click', '#logout-button', function () {
        localStorage.removeItem('token')
        window.location.assign('index.html')
    })

    $('body').on('click', '#update-profile', function() {
        event.preventDefault()
        const formData = new FormData(profileForm)

        const profileData = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            website: formData.get("website"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            instagram: formData.get("instagram"),
            facebook: formData.get("facebook"),
            twitter: formData.get("twitter"),
            linkedin: formData.get("linkedin"),
            about: formData.get('about'), 
        }
        console.log(profileData)
        const trimmedForm = trimForm(profileData); 
        trimmedForm.professional_id = user.id
        console.log(trimmedForm)
        if (Object.keys(trimmedForm).length > 0) {
            myAxios.put(API_URL + 'updateProfile', trimmedForm)
            .then(response => {
                console.log(response)
                profileForm.reset()
                getProfile(); 
            })
            .catch(err => {
                console.log(err)
            })
        } 
        // window.location.reload(); 
    })


});