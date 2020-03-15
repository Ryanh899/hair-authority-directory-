$( document ).ready(function() {



    const formContainer = document.querySelector('div#form-container')

    // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
    let API_URL = "http://localhost:3000/";
    // if (sessionStorage.getItem('justRegistered')) {
    //     $(formContainer).append(`<div id="submit-register" style="position: absolute; right: 6rem; bottom: 2rem" class="ha_button">Submit</div>`)
    // } else {
    //     $(formContainer).append(`<div id="submit-other" class="ha_button">Submit</div>`)
    // }


    $( '#submit-register' ).on('click', function () {
        const userInfo = {
            email: $('#email').val().trim(), 
            password: $('#password').val().trim()
        }
        const registerCheck = sessionStorage.getItem('lastLocation')
        axios.post(`${API_URL}auth/login`, userInfo)
            .then(response => {
                console.log(response)
                sessionStorage.setItem('token', response.data); 
                console.log(window.history)
                sessionStorage.setItem('lastLocation', 'sign-in')

                sessionStorage.removeItem('currentListing')
                sessionStorage.removeItem('customer_id')
                sessionStorage.removeItem('subscription_id')

                if (sessionStorage.getItem('routeToBilling')) {
                    sessionStorage.removeItem('routeToBilling')

                    window.location.assign('billing__new.html')
                } else if (registerCheck !== 'register') {
                    console.log('REGISTER')
                    console.log(sessionStorage.getItem('registered'))
                    sessionStorage.setItem('lastLocation', 'sign-in')

                    window.history.back(); 
                } else {
                    window.location.assign('index.html')
                }
            })
            .catch(err => {
                alert('email or password not found')
                // window.location.assign('register.html')
                console.log(err); 
            })
    })

    $('body').on('click', '#no-account', function () {
        sessionStorage.setItem('lastLocation', 'sign-in')

        window.location.assign('register.html')
    })
    
    
    $( '#back' ).on('click', function () {
        window.location.assign('index.html')
    })

});