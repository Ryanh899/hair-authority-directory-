$( document ).ready(function () {
    // grabbing elements 
    const form1 = document.querySelector('form#form-1')
    const form2 = document.querySelector('form#form-2')
    const submitButton = document.querySelector('#submit')

    $('body').on('click', '#submit', function() {
        event.preventDefault(); 
        const formData = new FormData(form1); 
        console.log(...formData)
        if (formData.get('businessTitle') && formData.get('businessDescription')) {
            const businessInfo = { 
                businessTitle: formData.get('businessTitle'), 
                businessDescription: formData.get('businessDescription')
              }
              console.log(businessInfo)
              $(form1).css('display', 'none')
              $(form2).css('display', 'block')
        } else {
            alert('Please Fill Out all info')
        }
        
      })
})