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

$(document).ready(function () {
    // style js 
    $('.vertical.menu .item').tab();
    const user = authHelper.parseToken(localStorage.getItem('token'))

    // append name
    const name = document.createElement('p')
    name.className = 'h2'
    $(name).css('display', 'inline-block')
    $(name).css('color', 'white')
    $(name).css('font-weight', 300)
    name.textContent = user.email
    $('#nav-welcome').append(name)

        // get profile info 
        +
        function getProfile() {
            myAxios.get(API_URL + 'profile/' + localStorage.getItem('token'))
                .then(resp => {
                    console.log(resp)
                })
                .catch(err => {
                    console.log(err)
                })
        }();

    $('body').on('click', '#listings-tab', function () {
        myAxios.get(API_URL + 'listings/' + localStorage.getItem('token'), {
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(resp => {
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
                                <div style="color: white;" class="listing-buttons editButton" id="${listing.id}"> <i class="edit icon"></i> Edit</div>
                                <div style="color: white;" class="listing-buttons deleteButton"> <i style="color: red;" class="delete icon"></i> Delete</div>
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


});