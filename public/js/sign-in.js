$( document ).ready(function() {
    $( '#submit' ).on('click', function () {
        const userInfo = {
            email: $('#email').val().trim(), 
            password: $('#password').val().trim()
        }
        axios.post('http://localhost:3000/auth/login', userInfo)
            .then(response => {
                console.log(response)
                localStorage.setItem('token', response.data); 
                window.location.assign('index.html')
            })
            .catch(err => {
                alert('email or password not found')
                window.location.assign('register.html')
                console.log(err); 
            })
    })
});