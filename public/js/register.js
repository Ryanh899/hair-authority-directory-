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
        var token = localStorage.getItem('token')
        if(token) {
            var userData = this.parseToken(token);
            var expirationDate = new Date(userData.exp * 1000)
            if(Date.now() > expirationDate) this.logOut()
        } else { 
            alert('not logged in')
            window.location.assign('sign-in.html')
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
    $( '#submit' ).on('click', function () {
        const userInfo = {
            email: $('#email').val().trim(), 
            password: $('#password').val().trim()
        }
        axios.post('http://localhost:3000/auth/register', userInfo)
            .then(response => {
                console.log(response)
                window.location.assign('sign-in.html')
            })
            .catch(err => {
                alert('user already exists')
                window.location.assign('sign-in.html')
            })
    })
});