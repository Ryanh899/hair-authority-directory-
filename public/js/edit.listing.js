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
let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"

const trimForm = function(obj) {
  // gets rid of empty responses
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
    // recurse
    else if (obj[key] == "" || obj[key] == "-----") delete obj[key]; // delete
  });
  return obj;
};

$(document).ready(function() {

  $('.ui.dropdown')
  .dropdown()
;
  // get listing
  myAxios
    .get(API_URL + "listing/" + localStorage.getItem("listingId"))
    .then(response => {
      const listing = response.data[0];
      const formContainer = document.querySelector("#form-container");
      console.log(listing);

      const header = document.createElement("p");
      header.className = "formHeader";
      header.textContent = listing.business_title;
      $(header).css("margin-top", "0rem");

      formContainer.prepend(header);

      const title = document.querySelector("input#business_title");
      const description = document.querySelector("textarea#business_description");
      const address = document.querySelector("input#street_address");
      const city = document.querySelector("input#city");
      const state = document.querySelector("input#state");
      const zip = document.querySelector("input#zip");
      const category = document.querySelector('input#category')
      const categoryDefault =document.querySelector('#select-default')
      const missionStatement = document.querySelector(
        "textarea#mission_statement"
      );
      const about = document.querySelector("textarea#about");

      $(title).attr("placeholder", listing.business_title);
      $(description).attr("placeholder", listing.business_description);
      $(address).attr("placeholder", listing.street_address);
      $(city).attr("placeholder", listing.city);
      $(state).attr("placeholder", listing.state);
      $(zip).attr("placeholder", listing.zip);
      $(missionStatement).attr("placeholder", listing.mission_statement);
      $(about).attr("placeholder", listing.about);
      categoryDefault.textContent = listing.category

      if (listing.website) {
        const website = document.querySelector("input#website");
        $(website).attr("placeholder", listing.website);
      }
      if (listing.instagram) {
        const instagram = document.querySelector("input#instagram");
        $(instagram).attr("placeholder", listing.instagram);
      }
      if (listing.facebook) {
        const facebook = document.querySelector("input#facebook");
        $(facebook).attr("placeholder", listing.facebook);
      }
      if (listing.twitter) {
        const twitter = document.querySelector("input#twitter");
        $(twitter).attr("placeholder", listing.twitter);
      }
      if (listing.linkedin) {
        const linkedin = document.querySelector("input#linkedin");
        $(linkedin).attr("placeholder", listing.linkedin);
      }
      if (listing.youtube) {
        const youtube = document.querySelector("input#youtube");
        $(youtube).attr("placeholder", listing.youtube);
      }
      if (listing.phone) {
        const phone = document.querySelector("input#phone");
        $(phone).attr("placeholder", listing.phone);
      }
      if (listing.email) {
        const email = document.querySelector("input#email");
        $(email).attr("placeholder", listing.email);
      }
      if (listing.faq0 && listing.answer0) {
        const faq0 = document.querySelector("input#faq0");
        const answer = document.querySelector("textarea#answer0");

        $(faq0).attr("placeholder", listing.faq0);
        $(answer).attr("placeholder", listing.answer0);
      }
      if (listing.faq1 && listing.answer1) {
        const faq1 = document.querySelector("input#faq1");
        const answer = document.querySelector("textarea#answer1");

        $(faq1).attr("placeholder", listing.faq1);
        $(answer).attr("placeholder", listing.answer1);
      }
      if (listing.faq2 && listing.answer2) {
        const faq2 = document.querySelector("input#faq2");
        const answer = document.querySelector("textarea#answer2");

        $(faq2).attr("placeholder", listing.faq2);
        $(answer).attr("placeholder", listing.answer2);
      }
    })
    .catch(err => {
      console.log(err);
    });

  $("body").on("click", "#update", function(event) {
    event.preventDefault();
    const form = document.querySelector("form#form-container");
    const formData = new FormData(form);
    const listingData = {
      business_title: formData.get("business_title"),
      business_description: formData.get("business_description"),
      street_address: formData.get("street_address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      // hours: {
      //   mon: `${formData.get("opening-hours-mon")}-${formData.get(
      //     "closing-hours-mon"
      //   )}`,
      //   tue: `${formData.get("opening-hours-tue")}-${formData.get(
      //     "closing-hours-tue"
      //   )}`,
      //   wed: `${formData.get("opening-hours-wed")}-${formData.get(
      //     "closing-hours-wed"
      //   )}`,
      //   thu: `${formData.get("opening-hours-thu")}-${formData.get(
      //     "closing-hours-thu"
      //   )}`,
      //   fri: `${formData.get("opening-hours-fri")}-${formData.get(
      //     "closing-hours-fri"
      //   )}`,
      //   sat: `${formData.get("opening-hours-sat")}-${formData.get(
      //     "closing-hours-sat"
      //   )}`,
      //   sun: `${formData.get("opening-hours-sun")}-${formData.get(
      //     "closing-hours-sun"
      //   )}`
      // },
      category: formData.get('category'), 
      website: formData.get("website"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      instagram: formData.get("instagram"),
      facebook: formData.get("facebook"),
      twitter: formData.get("twitter"),
      linkedIn: formData.get("linkedin"),
      mission_statement: formData.get('mission_statement'),
      about: formData.get('about'), 
      faq0: formData.get('faq0'), 
      answer0: formData.get('answer0'),
      faq1: formData.get('faq1'),
      answer1: formData.get('answer1'),
      faq2: formData.get('faq2'),
      answer2: formData.get('answer2')

    };
    console.log(listingData);
    const trimmedListing = trimForm(listingData);
    console.log(trimmedListing)
    if (Object.keys(trimmedListing).length > 0) {
        myAxios.put(API_URL + 'updateListing/' + localStorage.getItem('listingId'), trimmedListing)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err)
            })
    }
    window.location.assign('dashboard.html')

  });
  $("body").on("click", "#back-button", function(event) {
      window.location.assign('dashboard.html')
  })
});
