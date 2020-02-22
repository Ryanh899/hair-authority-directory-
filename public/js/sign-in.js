$( document ).ready(function() {
    const formContainer = document.querySelector('div#form-container')

    if (sessionStorage.getItem('justRegistered')) {
        $(formContainer).append(`<div id="submit-register" style="position: absolute; right: 6rem; bottom: 2rem" class="ha_button">Submit</div>`)
    } else {
        $(formContainer).append(`<div id="submit-other" class="ha_button">Submit</div>`)
    }
    $( '#submit-register' ).on('click', function () {
        const userInfo = {
            email: $('#email').val().trim(), 
            password: $('#password').val().trim()
        }
        axios.post('http://localhost:3000/auth/login', userInfo)
            .then(response => {
                console.log(response)
                localStorage.setItem('token', response.data); 
                console.log(window.history)
                window.location.assign('index.html')
            })
            .catch(err => {
                alert('email or password not found')
                // window.location.assign('register.html')
                console.log(err); 
            })
    })
    $( '#submit-other' ).on('click', function () {
        const userInfo = {
            email: $('#email').val().trim(), 
            password: $('#password').val().trim()
        }
        axios.post('http://localhost:3000/auth/login', userInfo)
            .then(response => {
                console.log(response)
                localStorage.setItem('token', response.data); 
                console.log(window.history)
                window.history.back()
            })
            .catch(err => {
                alert('email or password not found')
                // window.location.assign('register.html')
                console.log(err); 
            })
    })
    $( '#back' ).on('click', function () {
        window.location.assign('index.html')
    })

});