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
let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"

$(document).ready(function() {
  $("select.dropdown").dropdown();
  // localStorage.setItem("faq", 0);
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
  const categories = [
    "Dermatologist",
    "Hair Care Salons",
    "Hair Loss / Hair Care Products & Treatments",
    "Hair Replacement & Hair Systems",
    "Laser Therapy",
    "Medial / Hair Transplants",
    "Trichologist",
    "Wigs, Extensions, Hair Additions"
  ];
  const socialMedia = ["--", "Instagram", "Facebook", "Twitter", "LinkedIn"];
  const openingHoursField = document.querySelector("#opening-hours-field");
  const closingHoursField = document.querySelector("#closing-hours-field");

  days.forEach(day => {
    const field = document.createElement("div");
    field.className = "field";
    field.id = day;

    const label = document.createElement("label");
    label.textContent = day;

    const select = document.createElement("select");
    select.className = day + " ui search dropdown";
    select.name = "opening-hours-" + day.toLowerCase();

    const options = hours.map((hour, index) => {
      return (option = new Option(hour, hour));
    });

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
    label.textContent = day;

    const select = document.createElement("select");
    select.className = day + " ui search dropdown";
    select.name = "closing-hours-" + day.toLowerCase();

    const options = hours.map((hour, index) => {
      return (option = new Option(hour, hour));
    });
    closingHoursField.appendChild(field);
    field.appendChild(select);
    options.forEach(option => {
      select.append(option);
    });
  });

  // appending category select
  const categoryField = document.querySelector("#category-field");

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Category";
  categoryField.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.className = " ui search dropdown";
  categoryField.appendChild(categorySelect);
  categorySelect.name = "category";

  const categoryOptions = categories.map(category => {
    return (option = new Option(category, category));
  });

  categoryOptions.forEach(option => {
    categorySelect.append(option);
  });

  const smLabel = document.createElement("label");
  smLabel.textContent = "Social Media Links";
  $("#social-media").append(smLabel);

  const smSelector = document.createElement("select");
  smSelector.className = "smSelect";
  smLabel.append(smSelector);

  const smOptions = socialMedia.map(sm => {
    let smOption = new Option(sm, sm);
    smOption.className = "smOption";
    return smOption;
  });

  smOptions.forEach(sm => {
    smSelector.append(sm);
  });

  socialMedia.map(sm => {
    const field = document.createElement("div");
    field.className = "field";
    field.id = sm;
    $(field).css("display", "none");

    const label = document.createElement("label");
    label.textContent = sm;

    const input = document.createElement("input");
    input.id = sm;
    input.type = "text";
    input.name = sm.toLowerCase().trim();

    const smDiv = $("#social-media");

    smDiv.append(field);
    field.append(label);
    label.append(input);
  });

  $("body").on("change", ".smSelect", function(e) {
    const toShow = document.querySelector(`#${e.target.value}`);
    $(toShow).css("display", "block");
  });

  const FAQ = document.querySelector("#faq-section");

  for (var i = 0; i < 5; i++) {
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
    let questionNumber = localStorage.getItem("faq");
    const question = questionNumber + "faq";
    $(`#${question}`).css("display", "block");
    localStorage.setItem("faq", Number(questionNumber) + 1);
  });

  const form = document.querySelector("form");

  const trimForm = function(obj) {
      // gets rid of empty responses 
        Object.keys(obj).forEach(key => {
          if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]); // recurse
          else if (obj[key] == "" || obj[key] == "-----") delete obj[key]; // delete
        });
        return obj; 
  };

  function validateHours (form) {
    
  }

  $('body').on('click', '#back-button', function () {
    window.history.back()
  })


  $("body").on("click", "#listing-submit", function(e) {
    event.preventDefault();
    const formData = new FormData(form);
    console.log(...formData);
    const listingData = {
      businessTitle: formData.get("businessTitle"),
      businessSubtitle: formData.get("businessSubtitle"),
      streetAddress: formData.get("streetAddress"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      hours: {
        mon: `${formData.get("opening-hours-mon")}-${formData.get(
          "closing-hours-mon"
        )}`,
        tue: `${formData.get("opening-hours-tue")}-${formData.get(
          "closing-hours-tue"
        )}`,
        wed: `${formData.get("opening-hours-wed")}-${formData.get(
          "closing-hours-wed"
        )}`,
        thu: `${formData.get("opening-hours-thu")}-${formData.get(
          "closing-hours-thu"
        )}`,
        fri: `${formData.get("opening-hours-fri")}-${formData.get(
          "closing-hours-fri"
        )}`,
        sat: `${formData.get("opening-hours-sat")}-${formData.get(
          "closing-hours-sat"
        )}`,
        sun: `${formData.get("opening-hours-sun")}-${formData.get(
          "closing-hours-sun"
        )}`
      },
      website: formData.get("website"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      socialMedia: {
        instagram: formData.get("instagram"),
        facebook: formData.get("facebook"),
        twitter: formData.get("twitter"),
        linkedIn: formData.get("linkedin")
      },
      faq: {
        faq1: {
          question: formData.get("faq-question-0"),
          answer: formData.get("faq-answer-0")
        },
        faq2: {
          question: formData.get("faq-question-1"),
          answer: formData.get("faq-answer-1")
        },
        faq3: {
          question: formData.get("faq-question-2"),
          answer: formData.get("faq-answer-2")
        },
        faq4: {
          question: formData.get("faq-question-3"),
          answer: formData.get("faq-answer-3")
        },
        faq5: {
          question: formData.get("faq-question-4"),
          answer: formData.get("faq-answer-4")
        }
      },
      extraInfo: formData.get("extraInfo")
    };
    console.log(listingData);
    const trimmedListing = trimForm(listingData);
    myAxios.post(API_URL + 'listings', trimmedListing)
        .then(resp => {
            console.log(resp)
        })
        .catch(err => {
            console.log(err)
        })
  });

 
});
