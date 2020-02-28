$(document).ready(function () {

    $('body').on('click', '.continue-button', function (e) {
        let plan = $(e.target).id; 

        sessionStorage.setItem('plan', plan)
        window.location.assign('listing.form.html')
    })

    $("body").on("click", "#back-button", function() {
        sessionStorage.removeItem("listing-address");
        window.history.back();
      });
})