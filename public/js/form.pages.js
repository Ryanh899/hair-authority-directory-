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

  $('.ui.dropdown')
  .dropdown()
;

var today = new Date();
var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days

function setCookie(name, value)
  {
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
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
        if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]); // recurse
        else if (obj[key] == "" || obj[key] == "-----") delete obj[key]; // delete
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
    console.log(formData.get('category'))
    console.log(...formData);
    if (formData.get("businessTitle") === "" || undefined) {
      $("#businessTitle-div").css("border", "solid");
      $("#businessTitle-div").css("border-color", "red");
    } else if (formData.get("businessDescription") === "" || undefined) {
      $("#businessDescription-div").css("border", "solid");
      $("#businessDescription-div").css("border-color", "red");
    } else if (formData.get('category') === '--' || formData.get('category') === "") {
      $('#category-div').css('border', 'solid')
      $('#category-div').css('border-color', 'red')
    } else {
      finalForm.business_title = formData.get("businessTitle");
      finalForm.business_description = formData.get("businessDescription");
      finalForm.category = formData.get('category'); 
      sessionStorage.setItem('formsCompleted', 1);
      $(form1).css("display", "none");
      $(form2).css("display", "block");
      $("#businessTitle").toggleClass("active");
      $("#businessTitle").addClass('completed')
      $("#storefrontInfo").toggleClass("active");
      console.log(finalForm);
    }
  });

  // submit second form
  $("body").on("click", "#submit2", function() {
    event.preventDefault();
    console.log("clicked");
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
      (finalForm.street_address = formData.get("streetAddress")),
        (finalForm.city = formData.get("city")),
        (finalForm.state = formData.get("state")),
        (finalForm.zip = formData.get("zip")),
        (finalForm.monday = `${formData.get(
          "opening-hours-mon"
        )}-${formData.get("closing-hours-mon")}`),
        (finalForm.tuesday = `${formData.get(
          "opening-hours-tue"
        )}-${formData.get("closing-hours-tue")}`),
        (finalForm.wednesday = `${formData.get(
          "opening-hours-wed"
        )}-${formData.get("closing-hours-wed")}`),
        (finalForm.thursday = `${formData.get(
          "opening-hours-thu"
        )}-${formData.get("closing-hours-thu")}`),
        (finalForm.friday = `${formData.get(
          "opening-hours-fri"
        )}-${formData.get("closing-hours-fri")}`),
        (finalForm.saturday = `${formData.get(
          "opening-hours-sat"
        )}-${formData.get("closing-hours-sat")}`),
        (finalForm.sunday = `${formData.get(
          "opening-hours-sun"
        )}-${formData.get("closing-hours-sun")}`);
    }
    if (sessionStorage.getItem("24Hour")) {
      finalForm.hours = false;
    }

    trimForm(finalForm); 

    $(form2).css("display", "none");
    $(form3).css("display", "block");
    sessionStorage.setItem('formsCompleted', 2); 
    $("#storefrontInfo").toggleClass("active");
    $("#storefrontInfo").addClass('completed')
    $("#website").toggleClass("active");
    console.log(finalForm);
  });

  //submit third form
  $("body").on("click", "#submit3", function() {
    event.preventDefault();
    const formData = new FormData(form3);
    if (formData.get("website") !== "" || undefined)
      finalForm.website = formData.get("website");

    if (formData.get("instagram") !== "" || undefined)
      finalForm.instagram = formData.get("instagram");

    if (formData.get("facebook") !== "" || undefined)
      finalForm.facebook = formData.get("facebook");

    if (formData.get("twitter") !== "" || undefined)
      finalForm.twitter = formData.get("twitter");

    if (formData.get("linkedin") !== "" || undefined)
      finalForm.linkedin = formData.get("linkedin");

    $(form3).css("display", "none");
    $(form4).css("display", "block");
    sessionStorage.setItem('formsCompleted', 3); 
    $("#website").toggleClass("active");
    $("#website").addClass('completed')
    $("#contact").toggleClass("active");
    console.log(finalForm);
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
      $("#phone-div").css("border", "none");
      $(form4).css("display", "none");
      $(form5).css("display", "block");
      sessionStorage.setItem('formsCompleted', 4); 
      $("#contact").toggleClass("active");
      $("#contact").addClass('completed')
      $("#about").toggleClass("active");
      console.log(finalForm);
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
      finalForm.about = formData.get("about");

    $(form5).css("display", "none");
    $(form6).css("display", "block");
    sessionStorage.setItem('formsCompleted', 5); 
    $("#about").toggleClass("active");
    $("#about").addClass('completed')
    $("#images").toggleClass("active");
    console.log(finalForm);
  });

  //submit sixth form
  $("body").on("click", "#submit6", function() {
    event.preventDefault();
    const formData = new FormData(form6);
    // will be if for images
    // if (formData.get('ms') !== null || formData.get('ms') !== '') finalForm.missionStatement = formData.get('ms')
    if (formData.get("youtube") !== null || formData.get("youtube") !== "")
      finalForm.youtube = formData.get("youtube");

    $(form6).css("display", "none");
    $(form7).css("display", "block");
    sessionStorage.setItem('formsCompleted', 6); 
    $("#images").toggleClass("active");
    $("#images").addClass('completed')
    $("#faq").toggleClass("active");
    console.log(finalForm);
  });

  //submit seventh form
  $("body").on("click", "#submit7", function() {
    event.preventDefault();
    const formData = new FormData(form7);

    if (
      formData.get("faq-question-0") !== null ||
      formData.get("faq-question-0") !== ""
    ) {
      finalForm.faq0 = formData.get("faq-question-0");
    }
    if (
      formData.get("faq-answer-0") !== null ||
      formData.get("faq-answer-0") !== ""
    )
      finalForm.answer0 = formData.get("faq-answer-0");
    if (
      formData.get("faq-question-1") !== null ||
      formData.get("faq-question-1") !== ""
    )
      finalForm.faq1 = formData.get("faq-question-1");
    if (
      formData.get("faq-answer-1") !== null ||
      formData.get("faq-answer-1") !== ""
    )
      finalForm.answer1 = formData.get("faq-answer-1");
    if (
      formData.get("faq-question-2") !== null ||
      formData.get("faq-question-2") !== ""
    )
      finalForm.faq2 = formData.get("faq-question-2");
    if (
      formData.get("faq-answer-2") !== null ||
      formData.get("faq-answer-2") !== ""
    )
      finalForm.answer2 = formData.get("faq-answer-2");
    
    trimForm(finalForm); 
    console.log(finalForm);

    myAxios
      .post(API_URL + "newListing", {
        data: finalForm
      })
      .then(response => {
        console.log(response);
        alert('You will receive an email when your listing has been verified.'); 
        window.location.assign("index.html");
      })
      .catch(err => {
        console.log(err);
      });
  });

  // faq js
  const FAQ = document.querySelector("#faq-section");

  for (var i = 0; i < 3; i++) {
    const faqLabel = document.createElement("label");

    const faqField = document.createElement("div");
    faqField.className = "field";
    faqField.id = i + "faq";
    $(faqField).css("display", "none");

    const questionLabel = document.createElement("label");
    questionLabel.textContent = "Question:";
    $(questionLabel).css("display", "block");

    const faqQuestion = document.createElement("input");
    faqQuestion.name = "faq-question-" + i;

    const answerLabel = document.createElement("label");
    answerLabel.textContent = "Answer:";

    const faqAnswer = document.createElement("textarea");
    faqLabel.textContent = "FAQ #" + (i + 1);
    faqAnswer.name = "faq-answer-" + i;

    FAQ.append(faqField);
    faqField.append(faqLabel);
    faqLabel.append(questionLabel);
    questionLabel.append(faqQuestion);
    faqLabel.append(answerLabel);
    answerLabel.append(faqAnswer);
  }

  $("body").on("click", "#add-faq", function(e) {
    let questionNumber = sessionStorage.getItem("faq");
    const question = questionNumber + "faq";
    $(`#${question}`).css("display", "block");
    sessionStorage.setItem("faq", Number(questionNumber) + 1);
  });

  $("body").on("click", "#home-button", function(e) {
    window.location.assign('dashboard.html')
});

$('body').on('click', '#back-button', function () {
  window.history.back()
})
});
