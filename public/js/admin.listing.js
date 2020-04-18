// axios interceptor and creater
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
    console.log(error);
  }
);

//auth helper functions
var authHelper = {
  isLoggedIn() {
    const token = localStorage.getItem("token");
    if (token) {
      var userData = this.parseToken(token);
      var expirationDate = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate) this.logOut();
      return true;
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
    localStorage.removeItem("token");
  }
};

// API URL
// let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
let API_URL = "http://localhost:3000/api/";
const googleApiKey = "AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo";
const ZOHO_URL = "http://localhost:3000/zoho/";

// days of the week for business hours
const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// parse youtube
function YouTubeGetID(url) {
  var ID = "";
  url = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = url;
  }
  return ID;
}

// get channel from user url
function getChannelFromUrl(url) {
  var pattern = new RegExp(
    "^(https?://)?(www.)?youtube.com/(user/)?([a-z-_0-9]+)/?([?#]?.*)",
    "i"
  );
  var matches = url.match(pattern);
  if (matches) {
    return matches[4];
  }

  return url;
}

function getChannelIdFromUrl(url) {
  var pattern = /^(?:(http|https):\/\/[a-zA-Z-]*\.{0,1}[a-zA-Z-]{3,}\.[a-z]{2,})\/channel\/([a-zA-Z0-9_]{3,})$/;
  var matchs = url.match(pattern);
  if (!matchs === null) {
    return matchs[2];
  } else {
    return;
  }
}

function youtube_parser(url) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
}

const ADMIN_URL = "http://localhost:3000/admin/";

const am_pm_to_hours = time => {
  let realTime = time.split('').splice(1, 4)
  let amPm = time.split('').splice(5, 2).join('').toUpperCase()
  console.log(realTime, amPm)
  time = `${realTime.join('')} ${amPm}`
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  const AMPM = time.match(/\s(.*)$/)[1];
  if (AMPM.toLowerCase() === "pm" && hours < 12) hours = hours + 12;
  if (AMPM.toLowerCase() === "am" && hours == 12) hours = hours - 12;

  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = "0" + sHours;
  if (minutes < 10) sMinutes = "0" + sMinutes;

  return `${sHours}:${sMinutes}`;
}

function showErrModal (modal, header, description, errHeader, errMessage) {
  $(header).text(errHeader)
  $(description).text(errMessage)

  $(modal).modal('show')
}

// on ready
$(document).ready(function() {
  const page = document.querySelector("div#listing-page-root");
  const loader = document.querySelector("div#page-loader-div");
  const listingColumn = document.querySelector("div#listing-column");
  const titleSection = document.querySelector("div#title-section");
  const form = document.querySelector('form#admin-form')
  // function to initiate map
  function getGeolocation() {
    console.log("map");
    // navigator.geolocation.getCurrentPosition(drawMap);
    drawMap();
  }

  const quill = new Quill('#editor', {
    modules: {
      toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        [ 'bold', 'italic', 'underline', 'strike' ],
        [{ 'color': [] }],
        [{ 'header': '1' }, { 'header': '2' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
        [ 'direction', { 'align': [] }],
        [ 'link', 'image'],
        [ 'clean' ]
  ]
    },
    theme: 'snow'
  });

  let images = [];

  // function called by getGeolocation
  async function drawMap(geoPos) {
    // map center coords
    let geolocate;

    // if listing coords exist
    if (
      sessionStorage.getItem("listing-lat") !== "null" &&
      sessionStorage.getItem("listing-lng") !== "null"
    ) {
      console.log("COORDINATES");
      geolocate = new google.maps.LatLng(
        parseFloat(sessionStorage.getItem("listing-lat")),
        parseFloat(sessionStorage.getItem("listing-lng"))
      );

      // create map props for map generator
      let mapProp = {
        center: geolocate,
        zoom: 10,
        disableDefaultUI: true,
        zoomControl: false
      };
      // call google maps api to append the map to the #map div
      let map = new google.maps.Map(document.getElementById("map"), mapProp);
      // create a marker for the business
      let marker = new google.maps.Marker({
        position: geolocate,
        map: map,
        animation: google.maps.Animation.DROP
      });
      // reveal page and hide loader
      $("#images").css("dislplay", "");
      $(loader).css("display", "none");
      $(page).fadeIn(250);
    }
    // if the address exists
    else if (sessionStorage.getItem("listing-address") !== "null") {
      console.log("ADDRESS");
      // google geo coder init
      let geocoder = new google.maps.Geocoder();
      // get the address
      let full_address = sessionStorage.getItem("listing-address");
      console.log(full_address);
      // hit the google api with the address to get coordinates
      geocoder.geocode({ address: full_address }, function(results, status) {
        if (status == "OK") {
          console.log(results);
          geolocate = results[0].geometry.location;
          // create map props for map generator
          let mapProp = {
            center: geolocate,
            zoom: 10,
            disableDefaultUI: true,
            zoomControl: false
          };
          // call google maps api to append the map to the #map div
          let map = new google.maps.Map(
            document.getElementById("map"),
            mapProp
          );
          // create a marker for the business
          let marker = new google.maps.Marker({
            position: geolocate,
            map: map,
            animation: google.maps.Animation.DROP
          });
          // reveal page and hide loader
          $("#images").css("dislplay", "");
          $(loader).css("display", "none");
          $(page).fadeIn(250);
        } else {
          console.log(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
      // if no location get current location
    } else {
      // console.log("OTHER");
      // geolocate = new google.maps.LatLng(
      //   geoPos.coords.latitude,
      //   geoPos.coords.longitude
      // );
      //  // create map props for map generator
      //  let mapProp = {
      //   center: geolocate,
      //   zoom: 10,
      //   disableDefaultUI: true,
      //   zoomControl: false
      // };
      // // call google maps api to append the map to the #map div
      // let map = new google.maps.Map(
      //   document.getElementById("map"),
      //   mapProp
      // );
      // // create a marker for the business
      // let marker = new google.maps.Marker({
      //   position: geolocate,
      //   map: map,
      //   animation: google.maps.Animation.DROP
      // });
      // reveal page and hide loader
      $("#images").css("dislplay", "");
      $(loader).css("display", "none");
      $(page).css("display", "");
    }
  }

  // grabbing location from session storage
  let location = {
    lat: sessionStorage.getItem("listing-lat"),
    lng: sessionStorage.getItem("listing-lng")
  };

  // calling function to init map
  getGeolocation();

  // getting the current listing id from session storage
  const currentListing = sessionStorage.getItem("currentListing");
  const pendingListing = sessionStorage.getItem("pendingListing");
  const inactiveListing = sessionStorage.getItem("inactiveListing");

  let featurePut = document.getElementById("put");

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

  function displayQlPhoto(quill, image) {
    console.log(image)
    // imageSrc = S3Url + image
    let delta = quill.clipboard.convert(`<img src="${image}" class="ui small image"></img>`); 
    console.log(delta)
    quill.updateContents(delta)
  }

  // read uploaded image
function readQlFile(file, imagesArr, quill) {
  let FR = new FileReader();

  FR.addEventListener("load", function(base64Img) {
    // pass base64 image to be uploaded to jumbotron
    displayQlPhoto(quill, base64Img.target.result);
    imagesArr.push({ base: base64Img.target.result, file });
    // console.log(`images: ${images}`);
    console.log(imagesArr.length);

    // check if max images allowed
    // maxPhotos(images.length);
  });
  FR.readAsDataURL(file);
}

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
    console.log(image)
    let imageSplit = image.split('/')
    let exists = imageSplit[imageSplit.length-1]
    console.log(exists)
    // $('#other-append').append(`<img src="${image}" alt="image" class="ui small image">`);
    if (exists && exists !== 'null') {
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
    } else {
      console.log('no image')
    }
   
  }


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

  const fileButton = document.querySelector('input#ql-file-input')

  const handleQuillUpload = (selector, input, handler) => {
    // console.log(selector, handler)

    fileButton.addEventListener("click", event => {
      // event.preventDefault(); 
      const files = $('input#ql-file-input').files;
      if (files && files.length) {
        const size = (files[0].size / 1024 / 1024).toFixed(2);
        sessionStorage.setItem("imageUp", 0);
        if (files.length && size < 2) {
          handler(files[0]);
        } else {
          $("#submit6").css("background", "#696969");
          $("#submit6").off();
          $(selector).val("");
          $(".ui.basic.modal").modal("show");
          return false;
        }
      } else {
        return false
      }

    });

    $(fileButton).click(); 
  };

  let toolbar = quill.getModule('toolbar'); 
  toolbar.addHandler('image', handleQuillUpload)
  
  

  handleFileUpload("#put", async file => {
    const currentUser = authHelper.parseToken(sessionStorage.getItem("token"));
    console.log(file)
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
          listing_id: sessionStorage.getItem("currentListing") || sessionStorage.getItem('pendingListing'),
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
    console.log(file)
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
          listing_id: sessionStorage.getItem("currentListing") || sessionStorage.getItem('pendingListing'),
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

  handleFileUpload("input#ql-file-input", async file => {
    const currentUser = authHelper.parseToken(sessionStorage.getItem("token"));
    console.log(file); 
    sessionStorage.setItem(
      "imageUp",
      Number(sessionStorage.getItem("imageUp")) + 1
    );
    if (sessionStorage.getItem("imageUp") >= 8) {
      $("#otherimages").prop("disabled", true);
    }
    readQlFile(file, images, quill);

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

  if (pendingListing) {
    console.log('pending')
    // hit the api for the listing data by the id
    myAxios
      .get(ADMIN_URL + "listing/pending/" + pendingListing)
      .then(async response => {
        console.log(response);
        const listing = response.data.listing;
        const user = response.data.user;
        const subscription = response.data.subscription;
        const subscription__client = _.pick(
          subscription,
          "subscription_id",
          "status",
          "plan_code",
          "customer_id"
        );
        console.log(listing, user, subscription);

        const title = document.querySelector("input#business_title");
        const description = document.querySelector(
          "textarea#business_description"
        );
        const address = document.querySelector("input#street_address");
        const city = document.querySelector("input#city");
        const state = document.querySelector("input#state");
        const zip = document.querySelector("input#zip");
        const category = document.querySelector("input#category");
        const categoryAppend = document.querySelector("label.categoryAppend");
        const categoryDefault = document.querySelector("#category");
        const fullAddress = document.querySelector('input#full_address')
        const tagline = document.querySelector('input#tagline')
        const missionStatement = document.querySelector(
          "textarea#mission_statement"
        );
        const about = document.querySelector("textarea#about");
        const form = document.querySelector("form#admin-form");
        $(form).prepend(
          `<p class="logo-header" style="margin-bottom: .5px;">${listing.business_title}</p>`
        );
        $(title).attr("value", listing.business_title);
        // $(description).attr("placeholder", listing.business_description);
        if (listing.delta.length) {
          console.log(listing.delta[0].delta)
          quill.setContents(JSON.parse(listing.delta[0].delta))
        } else {
          let delta = quill.clipboard.convert(listing.business_description); 
          console.log(delta); 

          quill.setContents(delta)
        }
        $(address).attr("value", listing.street_address);
        $(city).attr("value", listing.city);
        $(state).attr("value", listing.state);
        $(zip).attr("value", listing.zip);
        $(fullAddress).attr("value", listing.full_address);
        $(missionStatement).attr("placeholder", listing.mission_statement);
        $(about).attr("value", listing.about);
        $(tagline).attr('value', listing.tagline)
        $(categoryAppend).append(
          `<p style="font-family: 'Lato'; font-weight: 400; font-size: 16px; margin-top: .5rem; margin-bottom: .5rem; color: black;" >${listing.category}</p>`
        );
        categoryDefault.textContent = listing.category;

        if (user) {
          const userValues = Object.values(user);
          Object.keys(user).forEach((attr, index) => {
            if (attr !== "id") {
              $("#user-segment").append(
                `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]} <a id="edit-${attr}" >Edit</a></p> `
              );
            } else {
              $("#user-segment").append(
                `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]}`
              );
            }
          });
        } else {
          $("#user-segment").append(
            `<p class="userInfo" style="text-align: center; font-size: 20px;" >Listing has not been claimed`
          );
        }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  days.forEach(day => {
    const fields = document.createElement('div')
    fields.className = 'fields'
    fields.id = day
    
    const opening_field = document.createElement("div");
    opening_field.className = "field";
    opening_field.id = day + 'opening-div'

    const opening_label = document.createElement("label");
    opening_label.textContent = `${day} open:`;
    opening_label.id = "labels-1";
    $(opening_label).css("font-size", "16px");

    const opening_input = document.createElement("input");
    opening_input.className = day + " ui search dropdown hours";
    opening_input.id = day + '-opening'
    opening_input.type = 'time'
    opening_input.name = "opening-hours-" + day.toLowerCase();
    if (listing[day]) {
      opening_input.defaultValue = am_pm_to_hours(listing[day].opening_hours)
    }

    const closing_field = document.createElement("div");
    closing_field.className = "field";
    closing_field.id = day + 'closing-field'

    const closing_label = document.createElement("label");
    closing_label.textContent = `${day} close:`;
    closing_label.id = "labels-1";
    $(closing_label).css("font-size", "16px");

    const closing_input = document.createElement("input");
    closing_input.className = day + " ui search dropdown hours";
    closing_input.id = day + '-closing'
    closing_input.type = 'time'
    closing_input.name = "closing-hours-" + day.toLowerCase();
    if (listing[day]) {
      closing_input.defaultValue = am_pm_to_hours(listing[day].closing_hours)
    }

    const hoursDiv = document.querySelector('div#hours-div')

    $(hoursDiv).append(fields); 
    $(fields).append(opening_field, closing_field)
    $(opening_field).append(opening_label, opening_input)
    $(closing_field).append(closing_label, closing_input)
  });

  //activate button
  const activate = document.querySelector('button.activate'); 
  const deactivate = document.querySelector('button.cancel'); 

    if (subscription) {
      $('#dual-buttons').css('display', ''); 
      $('#fluid-cancel').css('display', 'none')
      const subValues = Object.values(subscription__client);
      Object.keys(subscription__client).forEach((item, index) => {
        $("#subscription-segment").append(
          `<p class="userInfo" ><strong>${item}</strong>: ${subValues[index]} `
        );
      });
      activate.id = subscription.subscription_id
      deactivate.id = subscription.subscription_id
    }
 


        if (listing.website) {
          const website = document.querySelector("input#website");
          $(website).attr("value", listing.website);
        }
        if (listing.instagram) {
          const instagram = document.querySelector("input#instagram");
          $(instagram).attr("value", listing.instagram);
        }
        if (listing.facebook) {
          const facebook = document.querySelector("input#facebook");
          $(facebook).attr("value", listing.facebook);
        }
        if (listing.twitter) {
          const twitter = document.querySelector("input#twitter");
          $(twitter).attr("value", listing.twitter);
        }
        if (listing.linkedin) {
          const linkedin = document.querySelector("input#linkedin");
          $(linkedin).attr("value", listing.linkedin);
        }
        if (listing.youtube) {
          const youtube = document.querySelector("input#youtube");
          $(youtube).attr("value", listing.youtube);
        }
        if (listing.phone) {
          const phone = document.querySelector("input#phone");
          $(phone).attr("value", listing.phone);
        }
        if (listing.email) {
          const email = document.querySelector("input#email");
          $(email).attr("value", listing.email);
        }
        if (listing.faqs) {
          if (listing.faqs[0] && listing.faqs[0].faq !== 'tom'
          ) {
           const faq0 = document.querySelector("input#faq0");
           const answer = document.querySelector("textarea#answer0");
 
           console.log(listing.faqs[0].faq_answer)
           $(faq0).val(listing.faqs[0].faq);
           $(answer).val(listing.faqs[0].faq_answer);
         }
         if (listing.faqs[1] && listing.faqs[1].faq !== '') {
           const faq1 = document.querySelector("input#faq1");
           const answer = document.querySelector("textarea#answer1");
 
           $('#1faq').show()
           $(faq1).attr("value", listing.faqs[1].faq);
           $(answer).attr("value", listing.faqs[1].faq_answer);
         }
         if (listing.faqs[2] && listing.faqs[2].faq !== '') {
           const faq2 = document.querySelector("input#faq2");
           const answer = document.querySelector("textarea#answer2");
 
           $('#2faq').show()
           $(faq2).attr("value", listing.faqs[2].faq);
           $(answer).attr("value", listing.faqs[2].faq_answer);
         }
        }

        if (listing.feature_image && listing.feature_image !== null) {
          const featureImageSegment = document.querySelector(
            "div#feature_image"
          );
          const featureImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image}`;
          const featureId = listing.images.filter(x => !x.feature_image );
          console.log(featureId);
          displayPhoto(featureImage, featureId[0].image_id);
        }

        // filter images for null values
        let filteredImg = listing.images.filter(
          x => x.image_path !== "true" && x.image_path !== ""
        );

        console.log(filteredImg);

        // map images into an arr of dom elements
        const images = await filteredImg.map(image => {
          if (image.image_path !== "false") {
            let image_id = image.image_id;
            let feature_image = image.featured_image;

            let thisImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${image.image_path}`;

            return { image_id, thisImage, feature_image };
          }
        });
        // then filter those images for undefined
        let filteredImgs = images.filter(
          x => x.thisImage !== undefined && !x.feature_image
        );

        console.log(filteredImgs);

        filteredImgs.forEach(image => {
          displayOtherPhoto(image.thisImage, image.image_id);
        });
      })
      .catch(err => {
        console.log(err);
      });
  } else if (currentListing) {
    console.log('current')
    console.log(currentListing)
        // hit the api for the listing data by the id
        myAxios
        .get(ADMIN_URL + "listing/" + currentListing)
        .then(async response => {
          console.log(response);
          const listing = response.data.listing;
          const user = response.data.user;
          const subscription = response.data.subscription;
          const subscription__client = _.pick(
            subscription,
            "subscription_id",
            "status",
            "plan_code",
            "customer_id"
          );
          console.log(listing, user, subscription);
  
          const title = document.querySelector("input#business_title");
          const description = document.querySelector(
            "textarea#business_description"
          );
          const address = document.querySelector("input#street_address");
          const city = document.querySelector("input#city");
          const state = document.querySelector("input#state");
          const zip = document.querySelector("input#zip");
          const category = document.querySelector("input#category");
          const categoryAppend = document.querySelector("label.categoryAppend");
          const fullAddress = document.querySelector('input#full_address')
          const categoryDefault = document.querySelector("#category");
          const missionStatement = document.querySelector(
            "textarea#mission_statement"
          );
          const about = document.querySelector("textarea#about");
          const form = document.querySelector("form#admin-form");
  
          $(form).prepend(
            `<p class="logo-header" style="margin-bottom: .5px;">${listing.business_title}</p>`
          );
          $(title).attr("value", listing.business_title);
          // $(description).attr("placeholder", listing.business_description);
          if (listing.delta.length) {
            console.log(listing.delta[0].delta)
            quill.setContents(JSON.parse(listing.delta[0].delta))
          } else {
            let delta = quill.clipboard.convert(listing.business_description); 
            console.log(delta); 
  
            quill.setContents(delta)
          }
          $(address).attr("value", listing.street_address);
          $(city).attr("value", listing.city);
          $(state).attr("value", listing.state);
          $(zip).attr("value", listing.zip);
          $(missionStatement).attr("placeholder", listing.mission_statement);
          $(fullAddress).attr("value", listing.full_address);
          $(about).attr("value", listing.about);
          $(categoryAppend).append(
            `<p style="font-family: 'Lato'; font-weight: 400; font-size: 16px; margin-top: .5rem; margin-bottom: .5rem; color: black;" >${listing.category}</p>`
          );
          categoryDefault.textContent = listing.category;
  
          if (user) {
            const userValues = Object.values(user);
            Object.keys(user).forEach((attr, index) => {
              if (attr !== "id") {
                $("#user-segment").append(
                  `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]} <a id="edit-${attr}" >Edit</a></p> `
                );
              } else {
                $("#user-segment").append(
                  `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]}</p>`
                );
              }
            });
            if (!listing.claimed) {
              $("#user-segment").append(
                `<p class="userInfo" ><strong>Claimed</strong>: ${listing.claimed}  <button id='${subscription.subscription_id}' class="ui compact button verify-claim" >Verify</button> <button id='${subscription.subscription_id}' class="ui compact button deny-claim" >Deny</button> </p> `
              );
            } else {
              $("#user-segment").append(
                `<p class="userInfo" ><strong>Claimed</strong>: ${listing.claimed}  <button id='${subscription.subscription_id}' class="ui compact button ${listing.claimed ? 'unverify-claim' : 'verify-claim'}" >${listing.claimed ? 'Remove User' : 'Verify Claim'}</button> </p> `
              );
            }
             
          } else {
            $("#user-segment").append(
              `<p class="userInfo" style="text-align: center; font-size: 20px;" >Listing has not been claimed</p>`
            );
          }


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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  days.forEach(day => {
    const fields = document.createElement('div')
    fields.className = 'fields'
    fields.id = day
    
    const opening_field = document.createElement("div");
    opening_field.className = "field";
    opening_field.id = day + 'opening-div'

    const opening_label = document.createElement("label");
    opening_label.textContent = `${day} open:`;
    opening_label.id = "labels-1";
    $(opening_label).css("font-size", "16px");

    const opening_input = document.createElement("input");
    opening_input.className = day + " ui search dropdown hours";
    opening_input.id = day + '-opening'
    opening_input.type = 'time'
    opening_input.name = "opening-hours-" + day.toLowerCase();
    if (listing[day]) {
      opening_input.defaultValue = am_pm_to_hours(listing[day].opening_hours)
    }

    const closing_field = document.createElement("div");
    closing_field.className = "field";
    closing_field.id = day + 'closing-field'

    const closing_label = document.createElement("label");
    closing_label.textContent = `${day} close:`;
    closing_label.id = "labels-1";
    $(closing_label).css("font-size", "16px");

    const closing_input = document.createElement("input");
    closing_input.className = day + " ui search dropdown hours";
    closing_input.id = day + '-closing'
    closing_input.type = 'time'
    closing_input.name = "closing-hours-" + day.toLowerCase();
    if (listing[day]) {
      closing_input.defaultValue = am_pm_to_hours(listing[day].closing_hours)
    }

    const hoursDiv = document.querySelector('div#hours-div')

    $(hoursDiv).append(fields); 
    $(fields).append(opening_field, closing_field)
    $(opening_field).append(opening_label, opening_input)
    $(closing_field).append(closing_label, closing_input)
  });


  
   //activate button
  const activate = document.querySelector('button.activate'); 
  const cancel = document.querySelector('button.fluid-cancel'); 

    if (subscription) {
      const subValues = Object.values(subscription__client);
      Object.keys(subscription__client).forEach((item, index) => {
        $("#subscription-segment").append(
          `<p class="userInfo" ><strong>${item}</strong>: ${subValues[index]} `
        );
      });
      cancel.id = subscription.subscription_id
      
    }
  
          if (listing.tagline) {
            const website = document.querySelector("input#tagline");
            $(website).attr("value", listing.tagline);
          }
  
          if (listing.website) {
            const website = document.querySelector("input#website");
            $(website).attr("value", listing.website);
          }
          if (listing.instagram) {
            const instagram = document.querySelector("input#instagram");
            $(instagram).attr("value", listing.instagram);
          }
          if (listing.facebook) {
            const facebook = document.querySelector("input#facebook");
            $(facebook).attr("value", listing.facebook);
          }
          if (listing.twitter) {
            const twitter = document.querySelector("input#twitter");
            $(twitter).attr("value", listing.twitter);
          }
          if (listing.linkedin) {
            const linkedin = document.querySelector("input#linkedin");
            $(linkedin).attr("value", listing.linkedin);
          }
          if (listing.youtube) {
            const youtube = document.querySelector("input#youtube");
            $(youtube).attr("value", listing.youtube);
          }
          if (listing.phone) {
            const phone = document.querySelector("input#phone");
            $(phone).attr("value", listing.phone);
          }
          if (listing.email) {
            const email = document.querySelector("input#email");
            $(email).attr("value", listing.email);
          }
          if (listing.faqs) {
            if (listing.faqs[0] && listing.faqs[0].faq !== 'tom'
            ) {
             const faq0 = document.querySelector("input#faq0");
             const answer = document.querySelector("textarea#answer0");
   
             console.log(listing.faqs[0].faq_answer)
             $(faq0).val(listing.faqs[0].faq);
             $(answer).val(listing.faqs[0].faq_answer);
           }
           if (listing.faqs[1] && listing.faqs[1].faq !== '') {
             const faq1 = document.querySelector("input#faq1");
             const answer = document.querySelector("textarea#answer1");
   
             $('#1faq').show()
             $(faq1).attr("value", listing.faqs[1].faq);
             $(answer).attr("value", listing.faqs[1].faq_answer);
           }
           if (listing.faqs[2] && listing.faqs[2].faq !== '') {
             const faq2 = document.querySelector("input#faq2");
             const answer = document.querySelector("textarea#answer2");
   
             $('#2faq').show()
             $(faq2).attr("value", listing.faqs[2].faq);
             $(answer).attr("value", listing.faqs[2].faq_answer);
           }
          }
  
          if (listing.feature_image && listing.feature_image !== null) {
            const featureImageSegment = document.querySelector(
              "div#feature_image"
            );
            const featureImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image}`;
            const featureId = listing.images.filter(x => !x.feature_image);
            console.log(featureId);
            displayPhoto(featureImage, featureId[0].image_id);
          }
  
          // filter images for null values
          let filteredImg = listing.images.filter(
            x => x.image_path !== "true" && x.image_path !== ""
          );
  
          console.log(filteredImg);
  
          // map images into an arr of dom elements
          const images = await filteredImg.map(image => {
            if (image.image_path !== "false") {
              let image_id = image.image_id;
              let feature_image = image.featured_image;
  
              let thisImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${image.image_path}`;
  
              return { image_id, thisImage, feature_image };
            } else {
              return { thisImage: undefined }
            }
          });
          console.log(images)
          // then filter those images for undefined
          let filteredImgs = images.filter(
            x => x.thisImage !== undefined && !x.feature_image
          );
  
          console.log(filteredImgs);
  
          filteredImgs.forEach(image => {
            displayOtherPhoto(image.thisImage, image.image_id);
          });
        })
        .catch(err => {
          console.log(err);
        });
  } else if (inactiveListing) {
    console.log('current')
    console.log(inactiveListing)
        // hit the api for the listing data by the id
        myAxios
        .get(ADMIN_URL + "listing/inactive/" + inactiveListing)
        .then(async response => {
          console.log(response);
          const listing = response.data.listing;
          const user = response.data.user;
          const subscription = response.data.subscription;
          const subscription__client = _.pick(
            subscription,
            "subscription_id",
            "status",
            "plan_code",
            "customer_id"
          );
          console.log(listing, user, subscription);
  
          const title = document.querySelector("input#business_title");
          const description = document.querySelector(
            "textarea#business_description"
          );
          const address = document.querySelector("input#street_address");
          const city = document.querySelector("input#city");
          const state = document.querySelector("input#state");
          const zip = document.querySelector("input#zip");
          const category = document.querySelector("input#category");
          const categoryAppend = document.querySelector("label.categoryAppend");
          const fullAddress = document.querySelector('input#full_address')
          const categoryDefault = document.querySelector("#category");
          const missionStatement = document.querySelector(
            "textarea#mission_statement"
          );
          const about = document.querySelector("textarea#about");
          const form = document.querySelector("form#admin-form");
  
          $(form).prepend(
            `<p class="logo-header" style="margin-bottom: .5px;">${listing.business_title}</p>`
          );
          $(title).attr("value", listing.business_title);
          // $(description).attr("placeholder", listing.business_description);
          if (listing.delta.length) {
            console.log(listing.delta[0].delta)
            quill.setContents(JSON.parse(listing.delta[0].delta))
          } else {
            let delta = quill.clipboard.convert(listing.business_description); 
            console.log(delta); 
  
            quill.setContents(delta)
          }
          $(address).attr("value", listing.street_address);
          $(city).attr("value", listing.city);
          $(state).attr("value", listing.state);
          $(zip).attr("value", listing.zip);
          $(missionStatement).attr("placeholder", listing.mission_statement);
          $(fullAddress).attr("value", listing.full_address);
          $(about).attr("value", listing.about);
          $(categoryAppend).append(
            `<p style="font-family: 'Lato'; font-weight: 400; font-size: 16px; margin-top: .5rem; margin-bottom: .5rem; color: black;" >${listing.category}</p>`
          );
          categoryDefault.textContent = listing.category;
  
          if (user) {
            const userValues = Object.values(user);
            Object.keys(user).forEach((attr, index) => {
              if (attr !== "id") {
                $("#user-segment").append(
                  `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]} <a id="edit-${attr}" >Edit</a></p> `
                );
              } else {
                $("#user-segment").append(
                  `<p class="userInfo" ><strong>${attr}</strong>: ${userValues[index]}</p>`
                );
              }
            });
            $("#user-segment").append(
              `<p class="userInfo" ><strong>Claimed</strong>: ${listing.claimed}  <button id='${subscription.subscription_id}' class="ui compact button verify-claim" >${listing.claimed ? 'Remove User' : 'Verify Claim'}</button> </p> `
            );
          } else {
            $("#user-segment").append(
              `<p class="userInfo" style="text-align: center; font-size: 20px;" >Listing has not been claimed</p>`
            );
          }


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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  days.forEach(day => {
    const fields = document.createElement('div')
    fields.className = 'fields'
    fields.id = day
    
    const opening_field = document.createElement("div");
    opening_field.className = "field";
    opening_field.id = day + 'opening-div'

    const opening_label = document.createElement("label");
    opening_label.textContent = `${day} open:`;
    opening_label.id = "labels-1";
    $(opening_label).css("font-size", "16px");

    const opening_input = document.createElement("input");
    opening_input.className = day + " ui search dropdown hours";
    opening_input.id = day + '-opening'
    opening_input.type = 'time'
    opening_input.name = "opening-hours-" + day.toLowerCase();
    if (listing[day]) {
      opening_input.defaultValue = am_pm_to_hours(listing[day].opening_hours)
    }

    const closing_field = document.createElement("div");
    closing_field.className = "field";
    closing_field.id = day + 'closing-field'

    const closing_label = document.createElement("label");
    closing_label.textContent = `${day} close:`;
    closing_label.id = "labels-1";
    $(closing_label).css("font-size", "16px");

    const closing_input = document.createElement("input");
    closing_input.className = day + " ui search dropdown hours";
    closing_input.id = day + '-closing'
    closing_input.type = 'time'
    closing_input.name = "closing-hours-" + day.toLowerCase();
    if (listing[day]) {
      closing_input.defaultValue = am_pm_to_hours(listing[day].closing_hours)
    }

    const hoursDiv = document.querySelector('div#hours-div')

    $(hoursDiv).append(fields); 
    $(fields).append(opening_field, closing_field)
    $(opening_field).append(opening_label, opening_input)
    $(closing_field).append(closing_label, closing_input)
  });


  
   //activate button
  const activate = document.querySelector('button.activate'); 
  const cancel = document.querySelector('button.cancel'); 

    if (subscription) {
      $('#fluid-cancel').css('display', 'none'); 
      $('#fluid-activate').css('display', '')
      const subValues = Object.values(subscription__client);
      Object.keys(subscription__client).forEach((item, index) => {
        $("#subscription-segment").append(
          `<p class="userInfo" ><strong>${item}</strong>: ${subValues[index]} `
        );
      });
      activate.id = subscription.subscription_id
    }
  
          if (listing.tagline) {
            const website = document.querySelector("input#tagline");
            $(website).attr("value", listing.tagline);
          }
  
          if (listing.website) {
            const website = document.querySelector("input#website");
            $(website).attr("value", listing.website);
          }
          if (listing.instagram) {
            const instagram = document.querySelector("input#instagram");
            $(instagram).attr("value", listing.instagram);
          }
          if (listing.facebook) {
            const facebook = document.querySelector("input#facebook");
            $(facebook).attr("value", listing.facebook);
          }
          if (listing.twitter) {
            const twitter = document.querySelector("input#twitter");
            $(twitter).attr("value", listing.twitter);
          }
          if (listing.linkedin) {
            const linkedin = document.querySelector("input#linkedin");
            $(linkedin).attr("value", listing.linkedin);
          }
          if (listing.youtube) {
            const youtube = document.querySelector("input#youtube");
            $(youtube).attr("value", listing.youtube);
          }
          if (listing.phone) {
            const phone = document.querySelector("input#phone");
            $(phone).attr("value", listing.phone);
          }
          if (listing.email) {
            const email = document.querySelector("input#email");
            $(email).attr("value", listing.email);
          }
          if (listing.faqs) {
            if (listing.faqs[0] && listing.faqs[0].faq !== 'tom'
            ) {
             const faq0 = document.querySelector("input#faq0");
             const answer = document.querySelector("textarea#answer0");
   
             console.log(listing.faqs[0].faq_answer)
             $(faq0).val(listing.faqs[0].faq);
             $(answer).val(listing.faqs[0].faq_answer);
           }
           if (listing.faqs[1] && listing.faqs[1].faq !== '') {
             const faq1 = document.querySelector("input#faq1");
             const answer = document.querySelector("textarea#answer1");
   
             $('#1faq').show()
             $(faq1).attr("value", listing.faqs[1].faq);
             $(answer).attr("value", listing.faqs[1].faq_answer);
           }
           if (listing.faqs[2] && listing.faqs[2].faq !== '') {
             const faq2 = document.querySelector("input#faq2");
             const answer = document.querySelector("textarea#answer2");
   
             $('#2faq').show()
             $(faq2).attr("value", listing.faqs[2].faq);
             $(answer).attr("value", listing.faqs[2].faq_answer);
           }
          }
  
          if (listing.feature_image && listing.feature_image !== null) {
            const featureImageSegment = document.querySelector(
              "div#feature_image"
            );
            const featureImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image}`;
            const featureId = listing.images.filter(x => !x.feature_image);
            console.log(featureId);
            displayPhoto(featureImage, featureId[0].image_id);
          }
  
          // filter images for null values
          let filteredImg = listing.images.filter(
            x => x.image_path !== "true" && x.image_path !== ""
          );
  
          console.log(filteredImg);
  
          // map images into an arr of dom elements
          const images = await filteredImg.map(image => {
            if (image.image_path !== "false") {
              let image_id = image.image_id;
              let feature_image = image.featured_image;
  
              let thisImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${image.image_path}`;
  
              return { image_id, thisImage, feature_image };
            } else {
              return { thisImage: undefined }
            }
          });
          console.log(images)
          // then filter those images for undefined
          let filteredImgs = images.filter(
            x => x.thisImage !== undefined && !x.feature_image
          );
  
          console.log(filteredImgs);
  
          filteredImgs.forEach(image => {
            displayOtherPhoto(image.thisImage, image.image_id);
          });
        })
        .catch(err => {
          console.log(err);
        });
  }

  const updates = { business_description: {}, social_media: [], listing: {}, hours: [], faq: [] };

  $("input.social_media").on("input", function(e) {
    const id = $(e.target).attr("id");
    console.log(id);
    if (id !== undefined) {
        const findPlatform = updates.social_media.filter(x => x.platform === id ); 
        console.log(findPlatform)
      if (findPlatform.length) {
          console.log(findPlatform)
        let cut = updates.social_media.splice(updates.social_media.indexOf(findPlatform), 1); 
        console.log(cut)
        console.log(updates.social_media)
        updates.social_media.push({ platform: id, url: $(e.target).val().trim(), listing_id: sessionStorage.getItem('currentListing') || sessionStorage.getItem('pendingListing')})
      } else {
        updates.social_media.push({ platform: id, url: $(e.target).val().trim(), listing_id: sessionStorage.getItem('currentListing') || sessionStorage.getItem('pendingListing')})
      }
      console.log(updates);
    }

    $("#submit-button").show();
  });

  $("body").on("change", 'input.hours' ,function(e) {
    const id = $(e.target).attr("id").split('-')[0]; 
    const open = $(e.target).attr("id").split('-')[1] === 'opening' ? true : false
    console.log(id);
    if (id !== undefined) {
        const findPlatform = updates.hours.filter(x => x.day === id ); 
        console.log(findPlatform)
      if (findPlatform.length) {
          console.log(findPlatform)
        let cut = updates.hours.splice(updates.hours.indexOf(findPlatform), 1); 
        console.log(cut)
        console.log(updates.hours)
        updates.hours.push({ day: id, opening_hours: $(`#${id}-opening`).val(), closing_hours: $(`#${id}-closing`).val(),listing_id: sessionStorage.getItem('currentListing') || sessionStorage.getItem('pendingListing')})
      } else {
        updates.hours.push({ day: id, opening_hours: $(`#${id}-opening`).val(), closing_hours: $(`#${id}-closing`).val(),listing_id: sessionStorage.getItem('currentListing') || sessionStorage.getItem('pendingListing')})
      }
      console.log(updates);
    }

    $("#submit-button").show();
  });

  $("div.description").on("input", function(e) {
    console.log(quill.root.innerHTML)
    updates.business_description.delta = quill.getContents()
    updates.business_description.html = quill.root.innerHTML 
      
    console.log(updates);

  $("#description-submit-button").show();
});

  $("input.main").on("input", function(e) {
    const id = $(e.target).attr("id");
    if (id !== undefined) {
      updates.listing[id] = $(e.target)
        .val()
        .trim();
      console.log(updates);
    }

    $("#submit-button").show();
  });

  $("textarea.main").on("input", function(e) {
    const id = $(e.target).attr("id");
    if (id !== undefined) {
      updates.listing[id] = $(e.target)
        .val()
        .trim();
      console.log(updates);
    }

    $("#submit-button").show();
  });

  $("select.main").on("change", function(e) {
    const id = $(e.target).attr("id");
    if (id !== undefined) {
      updates.listing[id] = $(e.target)
        .val()
        .trim();
      console.log(updates);
    }

    $("#submit-button").show();
  });

  $("input#category").on("change", function(e) {
    const id = $(e.target).attr("id");
    if (id !== undefined) {
      updates.listing[id] = $(e.target)
        .val()
        .trim();
      console.log(updates);
    }

    $("#submit-button").show();
  });


  $("input.faq").on("input", function(e) {
    const id = $(e.target).attr("id");
    const answer = `faq_answer${id.split('')[3]}`; 
    const number = id.split('')[3]; 
    console.log(id);

    $(`#faq${number}-button`).show();
  });

  $("textarea.answer").on("input", function(e) {
    const id = $(e.target).attr("id");
    const answer = `faq_answer${id.split('')[6]}`; 
    const number = id.split('')[6]; 
    console.log(id);


    $(`#faq${number}-button`).show();
  });

  $('body').on('click', 'button.faqSubmit', function (e) {
      const id = $(e.target).attr('id')
      const number = id.split('')[3]; 

      
  })

  $("body").on("click", "button.submit-button", function(e) {
    console.log(updates);
    $(loader).show()
    if (Object.values(updates.listing).length) {
    updates.listing.id = sessionStorage.getItem('currentListing')
      myAxios
        .put("http://localhost:3000/api/stagelisting", updates.listing)
        .then(resp => {
            console.log(resp);
            // window.location.reload(); 
        })
        .catch(err => {
          console.log(err);
        });
    }
    
    if (updates.social_media.length) {
    updates.social_media.listing_id = sessionStorage.getItem('currentListing')
      myAxios
        .put("http://localhost:3000/api/stagelisting/social_media", updates.social_media)
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }   

    if (updates.hours) {
      updates.social_media.listing_id = sessionStorage.getItem('currentListing')
        myAxios
          .put("http://localhost:3000/api/stagelisting/hours", updates.hours)
          .then(resp => {
            console.log(resp);
          })
          .catch(err => {
            console.log(err);
          });
      }   

      if (Object.values(updates.business_description).length && $(e.target).attr('id') === 'description-submit-button') {
        let storeS3 = new Promise(async (resolve, reject) => {
          updates.business_description.listing_id = currentListing ? currentListing : pendingListing
          const currentUser = authHelper.parseToken(sessionStorage.getItem('token'))
          console.log(updates.business_description)
          const descriptionImages = images.filter(x => x.file)
          console.log(descriptionImages)
          if (descriptionImages.length) {
          let uploadImages = await descriptionImages.map(async (image, index) => {
              const urlAndKey = await (
                await fetch(
                  `/api/s3/sign_put?contentType=${image.file.type}&userId=${currentUser.id}`
                )
              ).json();
              console.log(urlAndKey);
              await fetch(urlAndKey.url, {
                method: "PUT",
                body: image.file
              })
                .then(data => {
                  // let image_path = urlAndKey.key;
                  // const storeImage = {
                  //   listing_id: sessionStorage.getItem("currentListing") || sessionStorage.getItem('pendingListing'),
                  //   image_path,
                  //   featured_image: false
                  // };
                  // myAxios
                  //   .post("http://localhost:3000/api/storeimage/delta", storeImage)
                  //   .then(resp => {
                  //     console.log(resp);
                  //   })
                  //   .catch(err => {
                  //     console.log(err);
                  //   });
                  console.log(data); 
                })
                .catch(err => {
                  console.log(err);
                });
            })
            resolve(uploadImages)
          } else {
            resolve()
          }
        })
        
        storeS3.then(response => {
        console.log(response)
        if (currentListing) {
          updates.business_description.listing_id = sessionStorage.getItem('currentListing'); 
          console.log(updates.business_description)
            myAxios
              .put("http://localhost:3000/api/updatedescription", updates.business_description)
              .then(resp => {
                console.log(resp); 
              })
              .catch(err => {
                console.log(err);
              });
        } else if (pendingListing) {
          updates.business_description.listing_id = sessionStorage.getItem('pendingListing'); 
          console.log(updates.business_description)
            myAxios
              .put("http://localhost:3000/api/updatedescription/staged", updates.business_description)
              .then(resp => {
                console.log(resp); 
              })
              .catch(err => {
                console.log(err);
              });
        }
      })
    }

      // if (Object.values(updates.business_description).length) {
      //   if (currentListing) {
      //     updates.business_description.listing_id = sessionStorage.getItem('currentListing'); 
      //     console.log(updates.business_description)
      //       myAxios
      //         .put("http://localhost:3000/api/updatedescription", updates.business_description)
      //         .then(resp => {
      //           console.log(resp); 
      //         })
      //         .catch(err => {
      //           console.log(err);
      //         });
      //   } else if (pendingListing) {
      //     updates.business_description.listing_id = sessionStorage.getItem('pendingListing'); 
      //     console.log(updates.business_description)
      //       myAxios
      //         .put("http://localhost:3000/api/updatedescription/staged", updates.business_description)
      //         .then(resp => {
      //           console.log(resp); 
      //         })
      //         .catch(err => {
      //           console.log(err);
      //         });
      //   }
    
      //   }   
  
    window.location.reload()

  });

  $(".ui.dropdown").dropdown({
    allowAdditions: true
  });

  $('body').on('click', '#back-button', function () {
    $(loader).show()
    window.history.back()
  })

  $('body').on('click', 'button.verify-claim', function (e) {
    // showErrModal('#error-modal', '#error-header', '#error-description', 'Are You Sure?', 'Click continue to verify claim.')
    let subId = $(this).attr('id'); 
    $(loader).show()
    myAxios.post(ADMIN_URL + 'claims/verify', { subscription: subId })
      .then(resp => {
        console.log(resp); 
        $('body').fadeOut(250); 
        window.location.assign('admin.portal.html')
      })
      .catch(err => {
        console.log(err)
      })
  }); 

  $('body').on('click', 'button.deny-claim', function (e) {
    // showErrModal('#error-modal', '#error-header', '#error-description', 'Are You Sure?', 'Click continue to deny claim.')
    let subId = $(this).attr('id'); 
    $(loader).show()
    myAxios.post(ADMIN_URL + 'claims/deny', { subscription: subId })
      .then(resp => {
        console.log(resp); 
        $('body').fadeOut(250); 
        window.location.assign('admin.portal.html')
      })
      .catch(err => {
        console.log(err)
      })
  }); 

  $('body').on('click', 'button.activate', function () {
    // showErrModal('#error-modal', '#error-header', '#error-description', 'Are You Sure?', 'Click continue to activate listing.')
    const subId = $(this).attr('id'); 
    $(loader).show()
    if (subId) {
      myAxios.post(ADMIN_URL + 'pending/verify', { subscription: subId})
        .then(resp => {
          console.log(resp); 
        $('body').fadeOut(250); 
        window.location.assign('admin.portal.html')
        })
        .catch(err => {
          console.error(err)
        })
    }
  })

  $('body').on('click', 'button.cancel', function () {
    // showErrModal('#error-modal', '#error-header', '#error-description', 'Are You Sure?', 'Click continue to cancel listing.')
    const subId = $(this).attr('id')
    $(loader).show()
    if (subId) {
      myAxios.post(ZOHO_URL + 'subscription/cancel', { subscription_id: subId})
        .then(resp => {
          console.log(resp); 
        $('body').fadeOut(250); 
        window.location.assign('admin.portal.html')
        })
        .catch(err => {
          console.error(err)
        })
    }
  })

  $('body').on('click', 'button.unverify-claim', function () {
    // showErrModal('#error-modal', '#error-header', '#error-description', 'Are You Sure?', 'Click continue to remove user from listing.')
    const subId = $(this).attr('id')
    $(loader).show()
    if (subId) {
      myAxios.post(ADMIN_URL + 'claims/unverify', { subscription: subId})
        .then(resp => {
          console.log(resp); 
        $('body').fadeOut(250); 
        window.location.assign('admin.portal.html')
        })
        .catch(err => {
          console.error(err)
        })
    }
  })
});
