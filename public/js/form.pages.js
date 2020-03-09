var myAxios = axios.create({
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
var authHelper = {
  isLoggedIn() {
    const token = sessionStorage.getItem("token");
    if (token) {
      var userData = this.parseToken(token);
      var expirationDate = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate) this.logOut();
      return true;
    } else {
      return false;
    }
  },
  isLoggedIn__professional() {
    const token = sessionStorage.getItem("token");
    if (token) {
      var userData = this.parseToken(token);
      var expirationDate = new Date(userData.exp * 1000);
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
  }
};

$(document).ready(function() {
  sessionStorage.setItem("faq", 1);
  sessionStorage.removeItem("24Hour");

  // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
  let API_URL = "http://localhost:3000/api/";

  var myAxios = axios.create({
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
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

  $(".ui.dropdown").dropdown({
    allowAdditions: true
  });

  var today = new Date();
  var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days

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
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      // myAxios.post('http://localhost:3000/api/stageListing', { business_title: formData.get('businessTitle') })
      // .then(resp => {
      // sessionStorage.setItem('stagedListing', resp.data[0]);
      // finalForm.id = resp.data[0];
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
      // })
      // .catch(err => {
      //   console.log(err)
      // })
      // finalForm.business_title = formData.get("businessTitle");
    }
  });

  // submit second form
  $("body").on("click", "#submit2", function() {
    event.preventDefault();
    console.log("clicked");
    let hoursForm = [];
    const formData = new FormData(form2);

    if (formData.get("streetAddress") === "" || undefined) {
      $("#streetAddress-div").css("border", "solid");
      $("#streetAddress-div").css("border-color", "red");
    } else if (formData.get("city") === "" || undefined) {
      $("#city-div").css("border", "solid");
      $("#city-div").css("border-color", "red");
    } else if (formData.get("state") === "" || undefined) {
      $("#state-div").css("border", "solid");
      $("#state-div").css("border-color", "red");
    } else if (formData.get("zip") === "" || undefined) {
      $("#zip-div").css("border", "solid");
      $("#zip-div").css("border-color", "red");
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
    }

    if (sessionStorage.getItem("24Hour")) {
      hoursForm = null;
    }
    let filteredHoursForm = hoursForm.filter(
      x => x.opening_hours !== "--" && x.closing_hours !== "--"
    );
    trimForm(finalForm);
    // myAxios.post('http://localhost:3000/api/stagelisting/hours/form2', [finalForm, filteredHoursForm] )
    //   .then(resp => {
    //     console.log(resp)
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
    // })
    // .catch(err => {
    //   console.log(err)
    // })
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

    // myAxios.put('http://localhost:3000/api/stagelisting/social_media', smForm )
    // .then(resp => {
    //   console.log(resp)
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
    // })
    // .catch(err => {
    //   console.log(err)
    // })
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

      // myAxios.put('http://localhost:3000/api/stagelisting', finalForm )
      // .then(resp => {
      //   console.log(resp)
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
      // })
      // .catch(err => {
      //   console.log(err)
      // })
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

    // myAxios.put('http://localhost:3000/api/stagelisting', finalForm )
    //   .then(resp => {
    //     console.log(resp)
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
    // })
    // .catch(err => {
    //   console.log(err)
    // })
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

    trimForm(faqForm);
    console.log(faqForm);
    console.log(finalForm);

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

        sessionStorage.setItem("lastLocation", "listing.form");
        window.location.assign("index.html");
      })
      .catch(err => {
        console.log(err);
      });
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

  var images = [];
  let featurePut = document.getElementById('put'); 

  // read uploaded image
  function readFile(file, id) {
    var FR = new FileReader();

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
    var FR = new FileReader();

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
    $("#other-image-append")
    .append(
      `<div style="display: none;" class="image other-image-display">
        <div class="overlay">
            <button id="${id}" type="button" class="ui basic icon button other-remove">
                  <i style="color: red;" class="large x icon" ></i>
              </button>
        </div>
        <img src="${image}" class="ui image">
      </div>`
      );
  let otherImages = document.querySelectorAll('div.other-image-display')
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
      sessionStorage.setItem('imageUp', 0)
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

  handleFileUpload('#put', async file => {
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
        sessionStorage.setItem('imageUp', Number(sessionStorage.getItem('imageUp'))+1)
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
        sessionStorage.setItem('imageUp', Number(sessionStorage.getItem('imageUp'))+1)
        if (sessionStorage.getItem('imageUp') >= 8 ) {
          $('#otherimages').prop('disabled', true)
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

  $(document).on("click", 'button.feature-remove', function(e) {
    e.preventDefault();
    console.log($(this).attr('id'))
    const clicked = $(this).attr('id')
    myAxios
      .delete(`http://localhost:3000/api/removeimage/feature/${clicked}`)
      .then(resp => {
        console.log(resp)
        $('#put').val("");
        $(featurePut).prop("disabled", false);
        sessionStorage.setItem('imageUp', Number(sessionStorage.getItem('imageUp'))-1)
        $("#feature-image-display").fadeOut();
        $("#feature-image-display").html("");
      })
      .catch(err => {
        console.log(err)
      })
  });

  $(document).on("click", 'button.other-remove', function(e) {
    e.preventDefault();
    console.log($(this).attr('id'))
    const clicked = $(this).attr('id')
    myAxios
      .delete(`http://localhost:3000/api/removeimage/${clicked}`)
      .then(resp => {
        console.log(resp)
        $('#otherimages').val(''); 
        $('#otherimages').prop('disabled', false)
        sessionStorage.setItem('imageUp', Number(sessionStorage.getItem('imageUp'))-1)
        $(this).parent().parent().fadeOut(500);
        $(this).parent().parent().html("");
      })
      .catch(err => {
        console.log(err)
      })
  });

  // $(window).bind('beforeunload', function(){
  //   return 'Are you sure you want to leave?';
  // });
});
