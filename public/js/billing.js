$(document).ready(function () {

    $('body').on('click', '.continue-button', function (e) {
        let plan = this.id; 

        sessionStorage.setItem('plan', plan)
        window.location.assign('listing.form.html')
    })

    $("body").on("click", "#back-button", function() {
        sessionStorage.removeItem("listing-address");
        window.history.back();
      });
})