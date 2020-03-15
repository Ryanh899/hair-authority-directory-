let myAxios = axios.create({
  headers: {
    Authorization: "Bearer " + sessionStorage.getItem("token")
  }
});
myAxios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response.status === 401) {
      return authHelper.logOut("./sign-in.html");
    } else {
      return Promise.reject(error);
    }
  }
);
let authHelper = {
  isLoggedIn() {
    const token = sessionStorage.getItem("token");
    if (token) {
      let userData = this.parseToken(token);
      let expirationDate = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate) this.logOut();
      return true;
    } else {
      return false;
    }
  },
  isLoggedIn__professional() {
    const token = sessionStorage.getItem("token");
    if (token) {
      let userData = this.parseToken(token);
      let expirationDate = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate) this.logOut();
      if (userData.isProfessionalUser) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  parseToken(token) {
    if (token) {
      return JSON.parse(window.atob(token.split(".")[1]));
    }
  },
  logOut() {
    sessionStorage.removeItem("token");
  },
  zohoRedirectCheck() {
    const url = window.location.href.split("=");
    const redirectId = url[1];
    if (redirectId) {
      return redirectId;
    } else {
      return false;
    }
  }, 
  subId__check () {
    const subId = JSON.parse(sessionStorage.getItem('subscription_id')); 
    if (subId) {
      now = new Date();
      expiration = new Date(subId.timestamp);
      expiration.setMinutes(expiration.getMinutes() + 30);
  
      // ditch the content if too old
      if (now.getTime() > expiration.getTime()) {


          return false
      } else {
        return true
      }
    } else {
      return false 
    }
  }
};

let ZOHO_URL = "http://localhost:3000/zoho/";

$(document).ready(function() {
  sessionStorage.setItem("faq", 1);
  sessionStorage.removeItem("24Hour");
  const allListings = [];
  
  let hostedCheck = authHelper.zohoRedirectCheck(); 

  if (hostedCheck) {
    const hostedId = hostedCheck
    console.log(hostedId)

    myAxios.post(ZOHO_URL + 'hostedpage/retrieve/new', { hostedId, token: sessionStorage.getItem('token') } )
      .then(async response => {
        console.log(response)
        if (!response.data.exists) {
          console.log('FIRST')
          const subscription = response.data[0]
          console.log(subscription)
  
          sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: subscription.subscription_id})); 
          sessionStorage.setItem('customer_id', subscription.customer_id); 
        } else if (response.data.exists && sessionStorage.getItem('formsCompleted')) {
          console.log('SECOND, FORMS COMPLETED')
          // if subscription id valid 
          const timeCheck = await authHelper.subId__check()

          if (timeCheck) {
            console.log('TIMECHECK')
            const subscription = response.data.subCheck[0]

            sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: subscription.subscription_id})); 
            sessionStorage.setItem('customer_id', subscription.customer_id); 
  
            let thisForm = (Number(sessionStorage.getItem('formsCompleted')) + 1)
            
            $(`#form-1`).css("display", "none");
            $(`#form-${thisForm}`).css("display", "block");
            $(".progress")
              .eq(sessionStorage.getItem("formsCompleted"))
              .addClass("active");
          } else {
            console.log('NO TIMECHECK')
            sessionStorage.removeItem('subscription_id');
            authHelper.logOut(); 
            sessionStorage.setItem('lastLocation', 'listing.form')
            alert('Your session has expired')
  
            window.location.assign('sign-in.html')
          }
        } else if (response.data.exists) {
          console.log('no timecheck + no forms completed')
          const subscription = response.data.subCheck[0]

            sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: subscription.subscription_id})); 
            sessionStorage.setItem('customer_id', subscription.customer_id); 
        } else {
          console.log('NONE')
          console.log(response.data)
          console.log(sessionStorage.getItem('formsCompleted'))
        }
      })
      .catch(err => {
        console.log(err)
      })
  } else {
    console.log('FROM BILLING, THIRD')
    const subCheck = authHelper.subId__check(); 

    if (!subCheck) {
      sessionStorage.removeItem('subscription_id');
            authHelper.logOut(); 
            sessionStorage.setItem('lastLocation', 'listing.form')
            alert('Your session has expired')
  
            window.location.assign('sign-in.html')
    } else if (subCheck && sessionStorage.getItem('formsCompleted')) {
      sessionStorage.setItem('subscription_id', JSON.stringify({ timeStamp: new Date(), value: JSON.parse(sessionStorage.getItem('subscription_id')).value})); 
      sessionStorage.setItem('customer_id', sessionStorage.getItem('customer_id'));

      let thisForm = (Number(sessionStorage.getItem('formsCompleted')) + 1)
            
            $(`#form-1`).css("display", "none");
            $(`#form-${thisForm}`).css("display", "block");
            $('.progress').slice(1, thisForm).addClass('active')
            $(".progress").eq(sessionStorage.getItem("formsCompleted")).addClass("active");
    } 
  }

  console.log(window.location.href);
  

  // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
  let API_URL = "http://localhost:3000/api/";

  $(".ui.dropdown").dropdown({
    allowAdditions: true
  });

  let today = new Date();
  let expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days

  function setCookie(name, value) {
    document.cookie =
      name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
  }

  $(".ui.checkbox").checkbox({
    onChecked: function() {
      console.log("checked");
      const openingHours = document.querySelector("#opening-hours-field");
      const closingHours = document.querySelector("#closing-hours-field");

      sessionStorage.setItem("24Hour", true);
      $(openingHours).fadeOut();
      $(closingHours).fadeOut();
    },
    onUnchecked: function() {
      console.log("checked");
      const openingHours = document.querySelector("#opening-hours-field");
      const closingHours = document.querySelector("#closing-hours-field");

      sessionStorage.setItem("24Hour", false);
      $(openingHours).fadeIn();
      $(closingHours).fadeIn();
    }
  });

  function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(str) {
    const isPhone = /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(
      str
    );
    return isPhone;
  }

  const trimForm = function(obj) {
    // gets rid of empty responses
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
      // recurse
      else if (obj[key] == "" || obj[key] == "--") delete obj[key]; // delete
    });
    return obj;
  };

  // grabbing elements
  const form1 = document.querySelector("form#form-1");
  const form2 = document.querySelector("form#form-2");
  const form3 = document.querySelector("form#form-3");
  const form4 = document.querySelector("form#form-4");
  const form5 = document.querySelector("form#form-5");
  const form6 = document.querySelector("form#form-6");
  const form7 = document.querySelector("form#form-7");
  const breadCrumb = document.querySelector("#footer");
  const submitButton = document.querySelector("#submit");

  const finalForm = {};
  if (sessionStorage.getItem('stagedListing')) {
    finalForm.id = sessionStorage.getItem('stagedListing')
  }
  

  const openingHoursField = document.querySelector("#opening-hours-field");
  const closingHoursField = document.querySelector("#closing-hours-field");

  const hours = [
    "--",
    "12:00 am",
    "1:00 am",
    "2:00 am",
    "3:00 am",
    "4:00 am",
    "5:00 am",
    "6:00 am",
    "7:00 am",
    "8:00 am",
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:00 pm",
    "5:00 pm",
    "6:00 pm",
    "7:00 pm",
    "8:00 pm",
    "9:00 pm",
    "10:00 pm",
    "11:00 pm"
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  days.forEach(day => {
    const field = document.createElement("div");
    field.className = "field";
    field.id = day;

    const label = document.createElement("label");
    label.textContent = `${day}`;
    label.id = "labels-1";
    $(label).css("font-size", "16px");

    const select = document.createElement("select");
    select.className = day + " ui search dropdown";
    select.name = "opening-hours-" + day.toLowerCase();

    const options = hours.map((hour, index) => {
      return (option = new Option(hour, hour));
    });

    const dash = document.createElement("div");
    dash.textContent = "--";
    $(dash).css("display", "inline");

    openingHoursField.appendChild(field);
    field.appendChild(label);
    label.appendChild(select);
    options.forEach(option => {
      select.append(option);
    });
  });
  days.forEach(day => {
    const field = document.createElement("div");
    field.id = day;
    field.className = "field";

    const label = document.createElement("label");
    label.textContent = `Close`;
    label.id = "labels-1";
    $(label).css("font-size", "16px");

    const select = document.createElement("select");
    select.className = day + " ui search dropdown";
    select.name = "closing-hours-" + day.toLowerCase();

    const options = hours.map((hour, index) => {
      return (option = new Option(hour, hour));
    });
    closingHoursField.appendChild(field);
    field.appendChild(label);
    label.appendChild(select);
    options.forEach(option => {
      select.append(option);
    });
  });

  //submit first form
  $("body").on("click", "#submit1", function() {
    event.preventDefault();
    const formData = new FormData(form1);
    console.log(formData.get("category"));
    console.log(...formData);
    if ( !sessionStorage.getItem('formsCompleted') || sessionStorage.getItem('formsCompleted') < 1 ) {

    if (formData.get("businessTitle") === "" || undefined) {
      $("#businessTitle-div").css("border", "solid");
      $("#businessTitle-div").css("border-color", "red");
    } else if (formData.get("businessDescription") === "" || undefined) {
      $("#businessDescription-div").css("border", "solid");
      $("#businessDescription-div").css("border-color", "red");
    } else if (
      formData.get("category") === "--" ||
      formData.get("category") === ""
    ) {
      $("#category-div").css("border", "solid");
      $("#category-div").css("border-color", "red");
    } else {
      const subscriptionId = JSON.parse(sessionStorage.getItem("subscription_id")).value;
      const customerId = sessionStorage.getItem("customer_id");
      const token = sessionStorage.getItem("token");
      myAxios
        .post("http://localhost:3000/api/stageListing", {
          business_title: formData.get("businessTitle"),
          subscription_id: subscriptionId,
          customer_id: customerId,
          token
        })
        .then(resp => {
          console.log(resp);
          if (resp.data.exists) {
            allListings.push(resp.data.listings);
            resp.data.listings.forEach(listing => {
              $("#exists-results").html(`<div
              style="margin-bottom: 1rem; background: #f8f8f8"
              class="ui grid segment listingItem-search"
              id="list-item"
            >
              <div style="padding: 1rem; padding-right: 0px;" class="row">
                <div  class="five wide middle aligned column">
                      <img
                      class="ui rounded image"
                      src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image ||
                        "placeholder.png"}"
                    />
                </div>
                <div class="eleven wide column">
                  <div class="ui grid">
                      <div
                      style="padding: 1rem 0rem 0rem .5rem;"
                      class="ten wide column"
                    >
                      <a href="#"  id="${
                        listing.id
                      }" class="listingTitle-search">
                        ${
                          listing.business_title
                        } <i class="small check circle icon" style="color: #1f7a8c;" ></i>
                      </a>
                      <p class="listingSubtitle-search">
                        ${listing.category || ""}
                      </p>
                      
                    </div>
                    <div
                    class="six wide computer only column"
                  >
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="small phone icon" ></i>${listing.phone ||
                        "999-999-9999"}
                    </p>
                    <p class="listing-info-text">
                      <i style="color: #1f7a8c;" class="location small arrow icon" ></i>${listing.city ||
                        listing.full_address}
                    </p>
                    <!-- <button style="margin-top: 1rem; background: #1f7a8c; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                  </div>
                  
                  <div class="fourteen wide column">
                    <p style="margin-top: 1rem;" id="listing-tagline-search">
                      ${listing.tagline} 
                    </p>
                     <button id="claim-${
                       listing.id
                     }" style="background: orange; color: white;" class="ui button claimButton" >Claim Your Business</button>
                  </div>
                  </div>
                  </div>
                </div>
            </div>`);
            });
            $(".ui.modal#exists-modal").modal("show");
          } else {
            sessionStorage.setItem("stagedListing", resp.data[0]);
            finalForm.id = resp.data[0];
            finalForm.tagline = formData.get("businessDescription");
            finalForm.category = formData.get("category");
            sessionStorage.setItem("formsCompleted", 1);
            console.log(sessionStorage.getItem("formsCompleted"));
            console.log($(".progress").eq(1));
            $(".progress")
              .eq(sessionStorage.getItem("formsCompleted"))
              .addClass("active");
            $(form1).css("display", "none");
            $(form2).css("display", "block");
            $("#businessTitle").toggleClass("active");
            $("#businessTitle").addClass("completed");
            $("#storefrontInfo").toggleClass("active");
            console.log(finalForm);
          }
        })
        .catch(err => {
          console.log(err);
        });
      finalForm.business_title = formData.get("businessTitle");
    }
  } else if (sessionStorage.getItem('formsCompleted') > 1) {
    console.log(sessionStorage.getItem("formsCompleted"));
    console.log($(".progress").eq(1));
    $(".progress")
      .eq(sessionStorage.getItem("formsCompleted"))
      .addClass("active");
    $(form1).css("display", "none");
    $(form2).css("display", "block");
    $("#businessTitle").toggleClass("active");
    $("#businessTitle").addClass("completed");
    $("#storefrontInfo").toggleClass("active");
    console.log(finalForm);
  } 

  });

  // submit second form
  $("body").on("click", "#submit2", function() {
    event.preventDefault();
    console.log("clicked");


    let hoursForm = [];
    const formData = new FormData(form2);
    
    if (formData.get("streetAddress") === "" || undefined) {
      let label = $("label[for='streetAddress']");
      $(label).css("color", "red");
    } else if (formData.get("city") === "" || undefined) {
      let label = $("label[for='city']");
      $(label).css("color", "red");
    } else if (formData.get("state") === "" || undefined) {
      let label = $("label[for='state']");
      $(label).css("color", "red");
    } else if (formData.get("zip") === "" || undefined) {
      let label = $("label[for='zip']");
      $(label).css("color", "red");
    } else if (formData.get("country") === "" || undefined) {
      let label = $("label[for='country']");
      $(label).css("color", "red");
    }
    // else if (formData.get('hours') === null || undefined) {
    //     console.log(formData.get('hours'))
    //     $('#hours-div').css('border', 'solid')
    //     $('#hours-div').css('border-color', 'red')
    // }
    else {
      finalForm.street_address = formData.get("streetAddress");
      finalForm.city = formData.get("city");
      finalForm.state = formData.get("state");
      finalForm.zip = formData.get("zip");
      finalForm.full_address = `${finalForm.street_address}, ${finalForm.city} ${finalForm.state}, ${finalForm.zip}`;
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-mon")}`,
        closing_hours: `${formData.get("closing-hours-mon")}`,
        day: "Monday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-tue")}`,
        closing_hours: `${formData.get("closing-hours-tue")}`,
        day: "Tuesday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-wed")}`,
        closing_hours: `${formData.get("closing-hours-wed")}`,
        day: "Wednesday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-thu")}`,
        closing_hours: `${formData.get("closing-hours-thu")}`,
        day: "Thursday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-fri")}`,
        closing_hours: `${formData.get("closing-hours-fri")}`,
        day: "Friday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-sat")}`,
        closing_hours: `${formData.get("closing-hours-sat")}`,
        day: "Saturday",
        listing_id: finalForm.id
      });
      hoursForm.push({
        opening_hours: `${formData.get("opening-hours-sun")}`,
        closing_hours: `${formData.get("closing-hours-sun")}`,
        day: "Sunday",
        listing_id: finalForm.id
      });

      if (sessionStorage.getItem("24Hour")) {
        hoursForm = null;
      }
      let filteredHoursForm = hoursForm.filter(
        x => x.opening_hours !== "--" && x.closing_hours !== "--"
      );
      trimForm(finalForm);
      myAxios
        .post("http://localhost:3000/api/stagelisting/hours/form2", [
          finalForm,
          filteredHoursForm
        ])
        .then(resp => {
          console.log(resp);
          $(form2).css("display", "none");
          $(form3).css("display", "block");
          sessionStorage.setItem("formsCompleted", 2);
          $(".progress")
            .eq(sessionStorage.getItem("formsCompleted"))
            .addClass("active");
          $("#storefrontInfo").toggleClass("active");
          $("#storefrontInfo").addClass("completed");
          $("#website").toggleClass("active");
          console.log(hoursForm);
          console.log(finalForm);
        })
        .catch(err => {
          console.log(err);
        });
    }

  });

  //submit third form
  $("body").on("click", "#submit3", function() {
    event.preventDefault();
    const smForm = [];
    const formData = new FormData(form3);
    if (formData.get("website") !== "" || undefined)
      smForm.push({
        platform: "website",
        url: formData.get("website"),
        listing_id: finalForm.id
      });

    if (formData.get("instagram") !== "" || undefined)
      smForm.push({
        platform: "instagram",
        url: formData.get("instagram"),
        listing_id: finalForm.id
      });

    if (formData.get("facebook") !== "" || undefined)
      smForm.push({
        platform: "facebook",
        url: formData.get("facebook"),
        listing_id: finalForm.id
      });

    if (formData.get("twitter") !== "" || undefined)
      smForm.push({
        platform: "twitter",
        url: formData.get("twitter"),
        listing_id: finalForm.id
      });

    if (formData.get("linkedin") !== "" || undefined)
      smForm.push({
        platform: "linkedin",
        url: formData.get("linkedin"),
        listing_id: finalForm.id
      });

    if (formData.get("youtube") !== null || formData.get("youtube") !== "")
      smForm.push({
        platform: "youtube",
        url: formData.get("youtube"),
        listing_id: finalForm.id
      });

    myAxios
      .put("http://localhost:3000/api/stagelisting/social_media", smForm)
      .then(resp => {
        console.log(resp);
        $(form3).css("display", "none");
        $(form4).css("display", "block");
        sessionStorage.setItem("formsCompleted", 3);
        $(".progress")
          .eq(sessionStorage.getItem("formsCompleted"))
          .addClass("active");
        $("#website").toggleClass("active");
        $("#website").addClass("completed");
        $("#contact").toggleClass("active");
        console.log(smForm);
        console.log(finalForm);
      })
      .catch(err => {
        console.log(err);
      });
  });

  //submit fourth form
  $("body").on("click", "#submit4", function() {
    event.preventDefault();
    const formData = new FormData(form4);
    console.log(formData.get("email"));
    if (formData.get("email") && validateEmail(formData.get("email"))) {
      finalForm.email = formData.get("email");
      $("#email-div").css("border", "none");
    } else {
      $("#email-div").css("border", "solid");
      $("#email-div").css("border-color", "red");
    }
    if (formData.get("phone") && validatePhone(formData.get("phone"))) {
      finalForm.phone = formData.get("phone");

      myAxios
        .put("http://localhost:3000/api/stagelisting", finalForm)
        .then(resp => {
          console.log(resp);
          $("#phone-div").css("border", "none");
          $(form4).css("display", "none");
          $(form5).css("display", "block");
          sessionStorage.setItem("formsCompleted", 4);
          $(".progress")
            .eq(sessionStorage.getItem("formsCompleted"))
            .addClass("active");
          $("#contact").toggleClass("active");
          $("#contact").addClass("completed");
          $("#about").toggleClass("active");
          console.log(finalForm);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      $("#phone-div").css("border", "solid");
      $("#phone-div").css("border-color", "red");
    }
  });

  //submit fifth form
  $("body").on("click", "#submit5", function() {
    event.preventDefault();
    const formData = new FormData(form5);

    if (formData.get("ms") !== null || formData.get("ms") !== "")
      finalForm.mission_statement = formData.get("ms");
    if (formData.get("about") !== null || formData.get("about") !== "")
      finalForm.business_description = formData.get("about");

    myAxios
      .put("http://localhost:3000/api/stagelisting", finalForm)
      .then(resp => {
        console.log(resp);
        $(form5).css("display", "none");
        $(form6).css("display", "block");
        sessionStorage.setItem("formsCompleted", 5);
        $(".progress")
          .eq(sessionStorage.getItem("formsCompleted"))
          .addClass("active");
        $("#about").toggleClass("active");
        $("#about").addClass("completed");
        $("#images").toggleClass("active");
        console.log(finalForm);
      })
      .catch(err => {
        console.log(err);
      });
  });

  //submit sixth form
  $("body").on("click", "#submit6", function() {
    event.preventDefault();
    const formData = new FormData(form6);
    // will be if for images
    // if (formData.get('ms') !== null || formData.get('ms') !== '') finalForm.missionStatement = formData.get('ms')
    $(form6).css("display", "none");
    $(form7).css("display", "block");
    sessionStorage.setItem("formsCompleted", 6);
    $(".progress")
      .eq(sessionStorage.getItem("formsCompleted"))
      .addClass("active");
    $("#images").toggleClass("active");
    $("#images").addClass("completed");
    $("#faq").toggleClass("active");
    console.log(finalForm);
  });

  //submit seventh form
  $("body").on("click", "#submit7", function() {
    event.preventDefault();
    const faqForm = [];
    const formData = new FormData(form7);

    if (
      formData.get("faq-question-0") !== null ||
      formData.get("faq-question-0") !== ""
    ) {
      faqForm.push({
        listing_id: finalForm.id,
        faq: formData.get("faq-question-0"),
        faq_answer: formData.get("faq-answer-0") || "N/A"
      });
    }

    if (
      formData.get("faq-question-1") !== null ||
      formData.get("faq-question-1") !== ""
    )
      faqForm.push({
        listing_id: finalForm.id,
        faq: formData.get("faq-question-1"),
        faq_answer: formData.get("faq-answer-1") || "N/A"
      });

    if (
      formData.get("faq-question-2") !== null ||
      formData.get("faq-question-2") !== ""
    )
      faqForm.push({
        listing_id: finalForm.id,
        faq: formData.get("faq-question-2"),
        faq_answer: formData.get("faq-answer-2") || "N/A"
      });

    // trimForm(faqForm);
    let trimmedFaq = faqForm.filter(x => x.faq_answer !== 'N/A' || !x.faq ); 
    console.log(trimmedFaq);
    console.log(finalForm);
    if (trimmedFaq.length) {
      myAxios
        .put("http://localhost:3000/api/stagelisting/faq", faqForm)
        .then(resp => {
          console.log(resp);
          $(form5).css("display", "none");
          $(form6).css("display", "block");
          sessionStorage.setItem("formsCompleted", 7);
          $(".progress")
            .eq(sessionStorage.getItem("formsCompleted"))
            .addClass("active");
          $("#about").toggleClass("active");
          $("#about").addClass("completed");
          $("#images").toggleClass("active");
          console.log(finalForm);

          sessionStorage.removeItem('stagedListing')
          sessionStorage.removeItem('faq')
          sessionStorage.removeItem('imageUp')
          sessionStorage.removeItem('formsCompleted')
          sessionStorage.removeItem('plan')

          sessionStorage.setItem("lastLocation", "listing.form");
          window.location.assign("index.html");
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      sessionStorage.removeItem('stagedListing')
      sessionStorage.removeItem('faq')
      sessionStorage.removeItem('imageUp')
      sessionStorage.removeItem('formsCompleted')
      sessionStorage.removeItem('plan')
      alert('You will be emailed when your business is verified')
      window.location.assign('index.html')
    }
  });

  $("body").on("click", "#add-faq", function(e) {
    if (Number(sessionStorage.getItem("faq") < 3)) {
      let questionNumber = sessionStorage.getItem("faq");
      sessionStorage.setItem("faq", Number(questionNumber) + 1);

      const question = questionNumber + "faq";
      $(`#${question}`).css("display", "block");
    } else {
      alert("Max of 3 FAQs allowed");
    }
  });

  $("body").on("click", "#home-button", function(e) {
    window.location.assign("dashboard.html");
  });

  $("body").on("click", "#back-button", function() {
    sessionStorage.setItem("lastLocation", "listing.form");
    window.history.back();
  });

  let images = [];
  let featurePut = document.getElementById("put");

  // read uploaded image
  function readFile(file, id) {
    let FR = new FileReader();

    FR.addEventListener("load", function(base64Img) {
      // pass base64 image to be uploaded to jumbotron
      displayPhoto(base64Img.target.result, id);
      images.push(base64Img.target.result);
      // console.log(`images: ${images}`);
      console.log(images.length);

      // check if max images allowed
      // maxPhotos(images.length);
    });
    FR.readAsDataURL(file);
  }

  // read uploaded image
  function readOtherFile(file, id) {
    let FR = new FileReader();

    FR.addEventListener("load", function(base64Img) {
      // pass base64 image to be uploaded to jumbotron
      displayOtherPhoto(base64Img.target.result, id);
      images.push(base64Img.target.result);
      // console.log(`images: ${images}`);
      console.log(images.length);

      // check if max images allowed
      // maxPhotos(images.length);
    });
    FR.readAsDataURL(file);
  }

  // display photo to top of jumbotron
  function displayPhoto(image, id) {
    // $('#other-append').append(`<img src="${image}" alt="image" class="ui small image">`);
    $(
      "#feature-append"
    ).append(`<div style="display: none;" id="feature-image-display" class="image">
  <div class="overlay">
      <button id="${id}" type="button" class="ui basic icon button feature-remove">
           <i style="color: red;" class="large x icon" ></i>
       </button>
  </div>
  <img src="${image}" class="ui image">
  </div>`);
    $("#feature-image-display").fadeIn();
    $(featurePut).prop("disabled", true);
  }

  function displayOtherPhoto(image, id) {
    $("#other-image-append").append(
      `<div style="display: none;" class="image other-image-display">
        <div class="overlay">
            <button id="${id}" type="button" class="ui basic icon button other-remove">
                  <i style="color: red;" class="large x icon" ></i>
              </button>
        </div>
        <img src="${image}" class="ui image">
      </div>`
    );
    let otherImages = document.querySelectorAll("div.other-image-display");
    $(otherImages).fadeIn();
  }

  // set max photos to 3
  // function maxPhotos(max) {
  //   if (max < 3) {
  //       $('#add-pet-form-message').empty();
  //       $('#add-pet-form-message').append('<i id="add-pet-upload" class="fas fa-camera fa-3x" for="add-pet-upload-photo"></i>');
  //       $('#add-pet-form-message').append('<input type="file" id="add-pet-upload-image" style="display: none;" />');
  //   } else if (max === 3) {
  //       $('#add-pet-form-message').empty();
  //       $('#add-pet-form-message').text('Max photos allowed!');
  //   }
  // };

  const handleFileUpload = (selector, handler) => {
    document.querySelector(selector).addEventListener("change", event => {
      const files = event.currentTarget.files;
      const size = (files[0].size / 1024 / 1024).toFixed(2);
      sessionStorage.setItem("imageUp", 0);
      if (files.length && size < 2) {
        handler(files[0]);
      } else {
        $("#submit6").css("background", "#696969");
        $("#submit6").off();
        $(featurePut).val("");
        $(".ui.basic.modal").modal("show");
        return false;
      }
    });
  };

  handleFileUpload("#put", async file => {
    const currentUser = authHelper.parseToken(sessionStorage.getItem("token"));
    const urlAndKey = await (
      await fetch(
        `/api/s3/sign_put?contentType=${file.type}&userId=${currentUser.id}`
      )
    ).json();
    console.log(urlAndKey);
    await fetch(urlAndKey.url, {
      method: "PUT",
      body: file
    })
      .then(data => {
        sessionStorage.setItem(
          "imageUp",
          Number(sessionStorage.getItem("imageUp")) + 1
        );
        console.log(data);
        let image_path = urlAndKey.key;
        const storeImage = {
          listing_id: sessionStorage.getItem("stagedListing"),
          image_path,
          featured_image: true
        };
        myAxios
          .post("http://localhost:3000/api/storeimage/feature", storeImage)
          .then(resp => {
            console.log(resp);
            readFile(file, resp.data[0].image_id);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });

  handleFileUpload("#otherimages", async file => {
    const currentUser = authHelper.parseToken(sessionStorage.getItem("token"));
    const urlAndKey = await (
      await fetch(
        `/api/s3/sign_put?contentType=${file.type}&userId=${currentUser.id}`
      )
    ).json();
    console.log(urlAndKey);
    await fetch(urlAndKey.url, {
      method: "PUT",
      body: file
    })
      .then(data => {
        sessionStorage.setItem(
          "imageUp",
          Number(sessionStorage.getItem("imageUp")) + 1
        );
        if (sessionStorage.getItem("imageUp") >= 8) {
          $("#otherimages").prop("disabled", true);
        }
        let image_path = urlAndKey.key;
        const storeImage = {
          listing_id: sessionStorage.getItem("stagedListing"),
          image_path,
          featured_image: false
        };
        myAxios
          .post("http://localhost:3000/api/storeimage", storeImage)
          .then(resp => {
            console.log(resp);
            readOtherFile(file, resp.data[0].image_id);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });

  $("body").on("click", "#image-size-ok", function() {
    $(".ui.basic.modal").modal("hide");
    $(featurePut).click();
  });

  $(document).on("click", "button.feature-remove", function(e) {
    e.preventDefault();
    console.log($(this).attr("id"));
    const clicked = $(this).attr("id");
    myAxios
      .delete(`http://localhost:3000/api/removeimage/feature/${clicked}`)
      .then(resp => {
        console.log(resp);
        $("#put").val("");
        $(featurePut).prop("disabled", false);
        sessionStorage.setItem(
          "imageUp",
          Number(sessionStorage.getItem("imageUp")) - 1
        );
        $("#feature-image-display").fadeOut();
        $("#feature-image-display").html("");
      })
      .catch(err => {
        console.log(err);
      });
  });

  $(document).on("click", "button.other-remove", function(e) {
    e.preventDefault();
    console.log($(this).attr("id"));
    const clicked = $(this).attr("id");
    myAxios
      .delete(`http://localhost:3000/api/removeimage/${clicked}`)
      .then(resp => {
        console.log(resp);
        $("#otherimages").val("");
        $("#otherimages").prop("disabled", false);
        sessionStorage.setItem(
          "imageUp",
          Number(sessionStorage.getItem("imageUp")) - 1
        );
        $(this)
          .parent()
          .parent()
          .fadeOut(500);
        $(this)
          .parent()
          .parent()
          .html("");
      })
      .catch(err => {
        console.log(err);
      });
  });

  $(document).on("click", "button.claim-button", function(e) {
    e.preventDefault();
    console.log($(this).attr("id"));
    const clicked = $(this)
      .attr("id")
      .split("-")[1];

    if (sessionStorage.getItem("token")) {
      sessionStorage.setItem("lastLocation", "listing");
      sessionStorage.setItem(
        "claimListing",
        sessionStorage.getItem("currentListing")
      );
      sessionStorage.removeItem("currentListing");
      // window.location.assign('billing__new.html');
    } else {
      sessionStorage.removeItem("currentListing");
      sessionStorage.setItem("lastLocation", "listing");
      sessionStorage.setItem(
        "claimListing",
        sessionStorage.getItem("currentListing")
      );
      window.location.assign("sign-in.html");
    }
  });

  $(document).on("click", "div.prev-button", function(e) {
    e.preventDefault();

    let thisForm = $(this)
      .attr("id")
      .split("-")[1];

    $(".progress").eq(thisForm-1).removeClass("active");
    $(`#form-${thisForm}`).css("display", "none");
    $(`#form-${thisForm - 1}`).css("display", "block");
  });

  $("body").on("click", "a.listingTitle-search", function(e) {
    const id = $(this).attr("id");
    console.log(allListings);
    // filter arr of all listings on page to find clicked on listing and get the id
    let getCoords = allListings[0].filter(x => x.id === id);
    console.log(getCoords);
    // set the last window location to search
    sessionStorage.setItem("lastLocation", "search");
    // set the current listing lat and lng in SS
    sessionStorage.setItem("listing-lat", getCoords[0].lat);
    sessionStorage.setItem("listing-lng", getCoords[0].lng);
    // set full address for if no coords
    sessionStorage.setItem("listing-address", getCoords[0].full_address);
    sessionStorage.setItem("currentListing", id);
    window.location.assign("listing.html");
  });

  // $(window).bind('beforeunload', function(){
    // sessionStorage.removeItem('stagedListing')
    // sessionStorage.removeItem('faq')
    // sessionStorage.removeItem('imageUp')
    // sessionStorage.removeItem('formsCompleted')
    // sessionStorage.removeItem('plan')
  // });
});
