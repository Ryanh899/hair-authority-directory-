
let API_URL = "http://localhost:3000/api/"
const S3Url = 'https://ha-images-02.s3-us-west-1.amazonaws.com/'

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

const categories = [
  { title: "Dermatologist" },
  { title: "Hair Care Salons" },
  { title: "Hair Loss / Hair Care Products & Treatments" },
  { title: "Hair Replacement & Hair Systems" },
  { title: "Laser Therapy" },
  { title: "Medical / Hair Transplants" },
  { title: "Trichologist" },
  { title: "Medical Hair Restoration" },
  { title: "Wigs / Extensions & Hair Additions" }
];

var authHelper = {
  isLoggedIn() {
    const token = localStorage.getItem("token");
    if (token) {
      var userData = this.parseToken(token);
      var expirationDate = new Date(userData.exp * 1000);
      if (Date.now() > expirationDate) {
        this.logOut();
      return false 
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
  parseToken(token) {
    return JSON.parse(window.atob(token.split(".")[1]));
  },
  logOut(path = "./sign-in.html") {
    localStorage.removeItem("token");
    window.location.assign(path);
  }
};

function titleCase(str) {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}

const trimForm = function(obj) {
  // gets rid of empty responses
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object") trimForm(obj[key]);
    // recurse
    else if (obj[key] == "" || obj[key] == null) delete obj[key]; // delete
  });
  return obj;
};

function displayOtherPhoto(image, id) {
  $(
    "#other-image-append"
  ).html('')
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

function displayPhotos(arr) {
  $(
    "#other-image-append"
  ).html('')
  arr.forEach(image => {
    $("#other-image-append").append(
      `<div style="display: none;" class="image other-image-display">
        <div class="overlay">
            <button id="${image.image_id}" type="button" class="ui basic icon button other-remove">
                <i style="color: red;" class="large x icon" ></i>
            </button>
        </div>
        <img src="${image.thisImage}" class="ui image">
      </div>`
    );
    let otherImages = document.querySelectorAll("div.other-image-display");
    $(otherImages).fadeIn();
  })
}


function displayQlPhoto(quill, image) {
  // imageSrc = S3Url + image
  let delta = quill.clipboard.convert(`<img src="${image}" class="ui small image"></img>`); 
  quill.updateContents(delta)
}


// read uploaded image
function readFile(file, id, imagesArr) {
  let FR = new FileReader();

  FR.addEventListener("load", function(base64Img) {
    // pass base64 image to be uploaded to jumbotron
    displayPhoto(base64Img.target.result, id);
    imagesArr.push(base64Img.target.result);

    // check if max images allowed
    // maxPhotos(images.length);
  });
  FR.readAsDataURL(file);
}

// read uploaded image
function readQlFile(file, imagesArr, quill) {
  let FR = new FileReader();

  FR.addEventListener("load", function(base64Img) {
    // pass base64 image to be uploaded to jumbotron
    displayQlPhoto(quill, base64Img.target.result);
    imagesArr.push({ base: base64Img.target.result, file });
    // console.log(`images: ${images}`);

    // check if max images allowed
    // maxPhotos(images.length);
  });
  FR.readAsDataURL(file);
}

// read uploaded image
function readOtherFile(file, id, imagesArr) {
  let FR = new FileReader();

  FR.addEventListener("load", function(base64Img) {
    // pass base64 image to be uploaded to jumbotron
    displayOtherPhoto(base64Img.target.result, id);
    imagesArr.push(base64Img.target.result);
    // console.log(`images: ${images}`);

    // check if max images allowed
    // maxPhotos(images.length);
  });
  FR.readAsDataURL(file);
}

// display photo to top of jumbotron
function displayPhoto(image, id) {
  let imageSplit = image.split('/')
  let exists = imageSplit[imageSplit.length-1]
  // $('#other-append').append(`<img src="${image}" alt="image" class="ui small image">`);
  $(
    "#feature-append"
  ).html('')
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
    $('#put').prop("disabled", true);
  } else {
    console.log('no image')
  }
 
}

function getMenuParams (listings) {
  return listings.map((listing, index) => {
    if (index === 0) {
      return {
        name: listing.business_title, 
        value: listing.id,
        selected: true
      }
    } else {
      return {
        name: listing.business_title, 
        value: listing.id
      }
    }
  })
}

function tierControl (plan_code) {
  // light plan
  // EXCLUDES: youtube, tagline, social media, faq, hours
  if (plan_code === 'd2f4f1f0-1ad5-4c3a-912d-6646a5a46d08') {
    console.log('light plan')
      $('#tagline').attr('disabled', true)
      $('#tagline-upgrade').html(`<p class="upgrade-text"><a class="updateSub" >Upgrade</a> your subscription to display</p>`)

      $('.sm-upgrade').html('<p class="upgrade-text"><a class="updateSub">Upgrade</a> your subscription to display</p>')
      $('input.social_media').attr('disabled', true); 

      $('input.hours').attr('disabled', true); 
      $('div.hours-upgrade').html('<p class="upgrade-text"><a class="updateSub">Upgrade</a> your subscription to display</p>')

      $('input.faq').attr('disabled',true); 
      $('textarea.answer').attr('disabled', true); 
      $('div.faq-upgrade').html(`<p class="upgrade-text"><a class="updateSub" >Upgrade</a> your subscription to display</p>`)
  } else if (plan_code === 'ea78d785-2a2c-4b74-b578-fab3509b669c') {
    console.log('standard plan')
      $('input.hours').attr('disabled', true); 
      $('div.hours-upgrade').html('<p class="upgrade-text"><a class="updateSub">Upgrade</a> your subscription to display</p>')

      $('input.faq').attr('disabled',true); 
      $('textarea.answer').attr('disabled', true); 
      $('div.faq-upgrade').html(`<p class="upgrade-text"><a class="updateSub" >Upgrade</a> your subscription to display</p>`)
  } else if (plan_code === '2528891f-8535-41dc-b07e-952b25113bd0' || plan_code === 'free-trial') {
    console.log('full access')
    $('.upgrade-text').css('display', 'none'); 
    $('input.faq').attr('disabled', false); 
    $('textarea.answer').attr('disabled', false); 
  } else {
    console.log('no plan code')
  }
}

async function appendListing (thisListing, quill, listingArr) {

  let listing = thisListing

  sessionStorage.setItem('currentListing', listing.id)
  sessionStorage.setItem('plan', listing.subscription.plan_code)

  if (listing.subscription) {
    const subValues = Object.values(listing.subscription);
    $('#subscription-segment').html('')
    Object.keys(listing.subscription).forEach((item, index) => {
      if (subValues[index]!==null)
      $("#subscription-segment").append(
        `<p class="userInfo" ><strong>${item}</strong>: ${subValues[index]} `
      );
    });
  }

      const title = document.querySelector("input#business_title");
      const description = document.querySelector(
        "div#editor"
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
 
      $(title).attr("value", listing.business_title);
      // $(description).text(listing.business_description);
      if (listing.delta && listing.delta.length) {
        quill.setContents(JSON.parse(listing.delta))
      } else {
        let delta = quill.clipboard.convert(listing.business_description); 

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
      $(categoryAppend).html(
        `<p id="labels-1" style="margin-top: .5rem; margin-bottom: .5rem; color: black;" >Category: <p class="input_text" style="margin-bottom: .25rem;" >${listing.category}</p></p>`
      );
      categoryDefault.textContent = listing.category;


const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
$('#hours-div').html('')
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
        displayPhoto(featureImage, featureId[0].image_id);
      }

      // filter images for null values
      let filteredImg = listing.images.filter(
        x => x.image_path !== "true" && x.image_path !== ""
      );


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
      let filteredImgs = images.filter(x => {
        if (x && !x.feature_image) {
          return x 
        }
        });

     


        displayPhotos(filteredImgs);

        console.log(listing.subscription.plan_code )
        tierControl(listing.subscription.plan_code)
}

const am_pm_to_hours = time => {
  let realTime = time.split('').splice(1, 4)
  let amPm = time.split('').splice(5, 2).join('').toUpperCase()
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




async function getListings (token, quill, listingArr, div, loader) {
  myAxios.get(API_URL + 'dashboard/listings/' + token)
    .then(async response => {
      console.log(response)
      const listings = response.data.listings; 
      const subscriptions = response.data.subscriptions; 


      sessionStorage.setItem('currentListing', listings[0].id)
      listings.forEach(listing => {
        listingArr.push(listing)
      })
      const dropDownColumn = document.querySelector('div#dropdown-column')

      let dropdownInput = document.createElement('input')
      dropdownInput.type="hidden"
      dropdownInput.name = 'listing-dropdown'
      dropdownInput.id = 'dropdown-menu'
      dropDownColumn.append(dropdownInput); 

      let defaultText = document.createElement('div')
      defaultText.className = 'listing-menu default text'
      defaultText.textContent = listings[0].business_title
      dropDownColumn.appendChild(defaultText)

      let dropdownButton = document.createElement('i'); 
      dropdownButton.className = 'huge dropdown icon'
      dropDownColumn.appendChild(dropdownButton)

      // let dropDownMenu = document.createElement('div')
      // dropDownMenu.className = 'ui menu listing-menu-drop'
      // dropDownMenu.id = 'listing-menu'
      // dropDownColumn.appendChild(dropDownMenu)

      // listings.forEach((listing, index) => {
      //   if (index === 0) {
      //     let dropDownA = document.createElement('a'); 
      //     dropDownA.className = 'listing-menu active item'
      //     dropDownA.textContent = listing.business_title
  
      //     dropDownMenu.appendChild(dropDownA)
      //   } else {
      //     let dropDownA = document.createElement('a'); 
      //     dropDownA.className = 'listing-menu item'
      //     dropDownA.textContent = listing.business_title
  
      //     dropDownMenu.appendChild(dropDownA)
      //   }
        
      // })
      let options = {}; 
      options.values = getMenuParams(listingArr); 

      console.log(options)

      $('div#dropdown-column').dropdown(options); 
      $('.ui.dropdown.main').dropdown(); 

      const firstListing = listings[0]; 
      console.log('PASSED TO APPEND', listings)
      console.log(firstListing)

      appendListing(firstListing, quill, listings) 
     
//       const listing = listings[0];

//       if (listing.subscription) {
//         const subValues = Object.values(listing.subscription);
//         Object.keys(listing.subscription).forEach((item, index) => {
//           $("#subscription-segment").append(
//             `<p class="userInfo" ><strong>${item}</strong>: ${subValues[index]} `
//           );
//         });
//       }
      

//       const title = document.querySelector("input#business_title");
//       const description = document.querySelector(
//         "div#editor"
//       );
//       const address = document.querySelector("input#street_address");
//       const city = document.querySelector("input#city");
//       const state = document.querySelector("input#state");
//       const zip = document.querySelector("input#zip");
//       const category = document.querySelector("input#category");
//       const categoryAppend = document.querySelector("label.categoryAppend");
//       const categoryDefault = document.querySelector("#category");
//       const fullAddress = document.querySelector('input#full_address')
//       const tagline = document.querySelector('input#tagline')
//       const missionStatement = document.querySelector(
//         "textarea#mission_statement"
//       );
//       const about = document.querySelector("textarea#about");
//       const form = document.querySelector("form#admin-form");

//       $(title).attr("value", listing.business_title);
//       // $(description).attr(listing.business_description);
//       if (listing.delta && listing.delta.length) {
//         quill.setContents(JSON.parse(listing.delta))
//       } else {
//         let delta = quill.clipboard.convert(listing.business_description); 

//         quill.setContents(delta)
//       }
//       $(address).attr("value", listing.street_address);
//       $(city).attr("value", listing.city);
//       $(state).attr("value", listing.state);
//       $(zip).attr("value", listing.zip);
//       $(fullAddress).attr("value", listing.full_address);
//       $(missionStatement).attr("placeholder", listing.mission_statement);
//       $(about).attr("value", listing.about);
//       $(tagline).attr('value', listing.tagline)
//       $(categoryAppend).html(
//         `<p style="font-family: 'Lato'; font-weight: 400; font-size: 16px; margin-top: .5rem; margin-bottom: .5rem; color: black;" >Category: ${listing.category}</p>`
//       );
//       $('#category').attr('placeholder', listing.category)
      
//       $('#dropdown-column').dropdown(options); 
      
//       $('.dropdown.main').dropdown(); 


// const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// $('#hours-div').html('')
// days.forEach(day => {
//   const fields = document.createElement('div')
//   fields.className = 'fields hours-fields'
//   fields.id = day
  
//   const opening_field = document.createElement("div");
//   opening_field.className = "field";
//   opening_field.id = day + 'opening-div'

//   const opening_label = document.createElement("label");
//   opening_label.textContent = `${day} open:`;
//   opening_label.id = "labels-1";
//   $(opening_label).css("font-size", "16px");

//   const opening_input = document.createElement("input");
//   opening_input.className = day + " ui search dropdown hours";
//   opening_input.id = day + '-opening'
//   opening_input.type = 'time'
//   opening_input.name = "opening-hours-" + day.toLowerCase();
//   if (listing[day]) {
//     opening_input.defaultValue = am_pm_to_hours(listing[day].opening_hours)
//   }

//   const closing_field = document.createElement("div");
//   closing_field.className = "field";
//   closing_field.id = day + 'closing-field'

//   const closing_label = document.createElement("label");
//   closing_label.textContent = `${day} close:`;
//   closing_label.id = "labels-1";
//   $(closing_label).css("font-size", "16px");

//   const closing_input = document.createElement("input");
//   closing_input.className = day + " ui search dropdown hours";
//   closing_input.id = day + '-closing'
//   closing_input.type = 'time'
//   closing_input.name = "closing-hours-" + day.toLowerCase();
//   if (listing[day]) {
//     closing_input.defaultValue = am_pm_to_hours(listing[day].closing_hours)
//   }

//   const hoursDiv = document.querySelector('div#hours-div')
  
//   $(hoursDiv).append(fields); 
//   $(fields).append(opening_field, closing_field)
//   $(opening_field).append(opening_label, opening_input)
//   $(closing_field).append(closing_label, closing_input)
// });





//       if (listing.website) {
//         const website = document.querySelector("input#website");
//         $(website).attr("value", listing.website);
//       }
//       if (listing.instagram) {
//         const instagram = document.querySelector("input#instagram");
//         $(instagram).attr("value", listing.instagram);
//       }
//       if (listing.facebook) {
//         const facebook = document.querySelector("input#facebook");
//         $(facebook).attr("value", listing.facebook);
//       }
//       if (listing.twitter) {
//         const twitter = document.querySelector("input#twitter");
//         $(twitter).attr("value", listing.twitter);
//       }
//       if (listing.linkedin) {
//         const linkedin = document.querySelector("input#linkedin");
//         $(linkedin).attr("value", listing.linkedin);
//       }
//       if (listing.youtube) {
//         const youtube = document.querySelector("input#youtube");
//         $(youtube).attr("value", listing.youtube);
//       }
//       if (listing.phone) {
//         const phone = document.querySelector("input#phone");
//         $(phone).attr("value", listing.phone);
//       }
//       if (listing.email) {
//         const email = document.querySelector("input#email");
//         $(email).attr("value", listing.email);
//       }
//       if (listing.faqs) {
//         if (listing.faqs[0] && listing.faqs[0].faq !== 'tom'
//         ) {
//          const faq0 = document.querySelector("input#faq0");
//          const answer = document.querySelector("textarea#answer0");

//          $(faq0).val(listing.faqs[0].faq);
//          $(answer).val(listing.faqs[0].faq_answer);
//        }
//        if (listing.faqs[1] && listing.faqs[1].faq !== '') {
//          const faq1 = document.querySelector("input#faq1");
//          const answer = document.querySelector("textarea#answer1");

//          $('#1faq').show()
//          $(faq1).attr("value", listing.faqs[1].faq);
//          $(answer).attr("value", listing.faqs[1].faq_answer);
//        }
//        if (listing.faqs[2] && listing.faqs[2].faq !== '') {
//          const faq2 = document.querySelector("input#faq2");
//          const answer = document.querySelector("textarea#answer2");

//          $('#2faq').show()
//          $(faq2).attr("value", listing.faqs[2].faq);
//          $(answer).attr("value", listing.faqs[2].faq_answer);
//        }
//       }

//       if (listing.feature_image && listing.feature_image !== null) {
//         const featureImageSegment = document.querySelector(
//           "div#feature_image"
//         );
//         const featureImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image}`;
//         const featureId = listing.images.filter(x => !x.feature_image );
//         displayPhoto(featureImage, featureId[0].image_id);
//       }

//       // filter images for null values
//       let filteredImg = listing.images.filter(
//         x => x.image_path !== "true" && x.image_path !== ""
//       );


//       // map images into an arr of dom elements
//       const images = await filteredImg.map(image => {
//         if (image.image_path !== "false") {
//           let image_id = image.image_id;
//           let feature_image = image.featured_image;

//           let thisImage = `https://ha-images-02.s3-us-west-1.amazonaws.com/${image.image_path}`;

//           return { image_id, thisImage, feature_image };
//         }
//       });

//       // then filter those images for undefined
//       let filteredImgs = images.filter(x => {
//         if (x && !x.feature_image) {
//           return x 
//         }
//         });


//       displayPhotos(filteredImgs);


//       console.log(listing.subscription.plan_code )
//       tierControl(listing.subscription.plan_code)
    
    })
    .catch(err => {
      console.error(err); 
    })
}





$(document).ready(function() {

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
        $(selector).val("");
        $(".ui.basic.modal").modal("show");
        return false;
      }
    });
  };

  const fileButton = document.querySelector('input#ql-file-input')

  const handleQuillUpload = (selector, input, handler) => {

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
            readFile(file, resp.data[0].image_id, images);
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
          listing_id: sessionStorage.getItem("currentListing") || sessionStorage.getItem('pendingListing'),
          image_path,
          featured_image: false
        };
        myAxios
          .post("http://localhost:3000/api/storeimage", storeImage)
          .then(resp => {
            console.log(resp);
            readOtherFile(file, resp.data[0].image_id, images);
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
  
  
  

  let listings = []; 

  $('.secondary.menu .item').tab(); 

//     let API_URL; 
//   if (process.env.NODE_ENV = 'production') {
//     API_URL = "ec2-54-90-69-186.compute-1.amazonaws.com/api/";
//   } else {
//     API_URL = "http://localhost:3000/api/";
//   }
// let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"

// function to initiate map
function getGeolocation() {
  // navigator.geolocation.getCurrentPosition(drawMap);
  drawMap();
}

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
    // $(loader).css("display", "none");
    // $(page).fadeIn(250);
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
        // $(loader).css("display", "none");
        // $(page).fadeIn(250);
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

  // style js
  $(".vertical.menu .item").tab();
  const user = authHelper.parseToken(sessionStorage.getItem("token"));
  const token = sessionStorage.getItem('token'); 




  //getting inputs
  const profileForm = document.querySelector("form#profile-form");
  const firstName = document.querySelector("input#first-name");
  const lastName = document.querySelector("input#last-name");
  const email = document.querySelector("input#email-input");
  const phone = document.querySelector("input#phone-input");
  const profileName = document.querySelector("h1#name");
  // append name
  const name = document.createElement("p");
  name.className = "h2";
  $(name).css("display", "inline-block");
  $(name).css("color", "white");
  $(name).css("font-weight", 300);
  name.textContent = user.email;
  $("#nav-welcome").append(name);

  $('body').on('change', '#dropdown-menu', function () {
    let active = $('#dropdown-menu').val(); 
    let thisListing = listings.filter(listing => listing.id === active ); 
    thisListing = thisListing[0];
    console.log(thisListing)
    appendListing(thisListing, quill, listings) 
    if (thisListing.lat && thisListing.lng) {
      sessionStorage.setItem('listing-lat', thisListing.lat)
      sessionStorage.setItem('listing-lng', thisListing.lng)
    } else if (thisListing.full_address) {
      sessionStorage.setItem('listing-lat', 'null')
      sessionStorage.setItem('listing-lng', 'null')
      sessionStorage.setItem('listing-address', thisListing.full_address)
    }

    getGeolocation()
  })

  // get profile info

  function getProfile() {
    const token = sessionStorage.getItem('token'); 

    myAxios.get(API_URL + 'user/profile/' + token)
      .then(response => {
        const user = response.data[0]
        console.log(user)

        $('#display-name').html(`${user.first_name} ${user.last_name}`)
        $('#user-phone').html(`${user.phone}`)
        $('#user-email').html(`${user.email}`)
      })
      .catch(err => {
        console.error(err)
      })
  }

  getProfile()

  // let images = [];
let featurePut = document.getElementById("put");



$("body").on("click", "#image-size-ok", function() {
  $(".ui.basic.modal").modal("hide");
  $('#put').click();
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
      $('#put').prop("disabled", false);
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
  // getProfile();

  getListings(token, quill, listings)


  // $("body").on("click", "#listings-tab", function() {
  //   myAxios
  //     .get(API_URL + "listings/" + localStorage.getItem("token"), {
  //       headers: {
  //         "Content-Type": "application/json"
  //         // 'Content-Type': 'application/x-www-form-urlencoded',
  //       }
  //     })
  //     .then(resp => {
  //       $("#listings-div").html("");
  //       const response = resp.data;
  //       if (response.length === 0) {
  //         $("#listings-div").html(`<h1 class="h1" >You have no listings</h1>
  //                                          <h2 class="h2">But you could... </h2>
  //                                          <button id="add-listing-button" class="ui button">Make a listing</button>`);
  //       } else {
  //         console.log(response);
  //         $("#listings-div").html("");
  //         response.forEach(listing => {
  //           $("#listings-div").append(`
  //                       <div style="margin-bottom: 1rem;" class="listingItem ui grid">
  //                           <div class="row">
  //                           <div class="six wide middle aligned column">
  //                           <p class="listingTitle">
  //                             ${listing.business_title}
  //                           </p>
  //                           <p class="listingSubtitle" >${listing.business_description}</p>
  //                           </div>
  //                           <div class="six wide column"></div>
  //                           <div class="four wide column">
  //                               <a id="${listing.id}" class="editButton" ><div style="color: white;" class="listing-buttons " id="${listing.id}"> <i style="pointer-events:none" class="edit icon"></i> Edit</div></a>
  //                               <a id="${listing.id}" class="editButton" ><div style="color: white;" class="listing-buttons "> <i style="pointer-events:none" style="color: red;" class="delete icon"></i> Delete</div></a>
  //                           </div>
  //                           </div>
  //                       </div>
  //                          `);
  //         });
  //       }
  //     })
  //     .catch(err => console.log(err));
  // });




  $("body").on("click", "#add-listing-button", function() {
    window.location.assign("listing.form.html");
  });

  $("body").on("click", "#logout-button", function() {
    localStorage.removeItem("token");
    window.location.assign("index.html");
  });

  $("body").on("click", ".editButton", function(e) {
    localStorage.setItem("listingId", e.target.id);
    window.location.assign("edit.listing.html");
  });

  $("body").on("click", ".deleteButton", function() {
    alert("edit");
  });

  $("body").on("click", "#newListing", function() {
    window.location.assign("listing.form.html");
  });

  $("body").on("click", "#logout-button", function() {
    localStorage.removeItem("token");
    window.location.assign("index.html");
  });

  $("body").on("click", "#update-profile", function() {
    event.preventDefault();
    const formData = new FormData(profileForm);

    const profileData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone: formData.get("phone"),
      email: formData.get("email")
    };
    console.log(profileData);
    const trimmedForm = trimForm(profileData);
    trimmedForm.id = user.id;
    console.log(trimmedForm);
    if (Object.keys(trimmedForm).length > 0) {
      myAxios
        .put(API_URL + "updateProfile", trimmedForm)
        .then(response => {
          console.log(response);
          if (response.status === 401) {
            alert(response.data);
          }
          profileForm.reset();
          getProfile();
        })
        .catch(err => {
          console.log(err);
        });
    }
    // window.location.reload();
  });

  $('body').on('click', '#back-button', function () {
    window.location.assign('index.html')
  })



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

  $("div.description").on("input", function(e) {
      console.log(quill.root.innerHTML)
      updates.business_description.delta = quill.getContents()
      updates.business_description.html = quill.root.innerHTML 
        
      console.log(updates);

    $("#description-submit-button").show();
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

  // on update click
  $(document).on("click", ".updateSub", function(e) {
    e.preventDefault();
    // set update to the current listing id (user token in storage)
    sessionStorage.setItem('update', JSON.stringify({ timeStamp: new Date(), value: sessionStorage.getItem('currentListing') })); 
    // send to billing page
    window.location.assign('billing__update.html')
  });

  $("body").on("click", "button.submit-button", function(e) {
    console.log(updates);
    e.preventDefault(); 
    let pendingCheck = sessionStorage.getItem('pendingListing')
    let currentListing = sessionStorage.getItem('currentListing')
    if (Object.values(updates.listing).length && currentListing) {
    updates.listing.id = currentListing
      myAxios
        .put("http://localhost:3000/api/updatelisting", updates.listing)
        .then(resp => {
            console.log(resp);
            // window.location.reload(); 
        })
        .catch(err => {
          console.log(err);
        });
    } else if (Object.values(updates.listing).length && pendingListing) {
      updates.listing.id = pendingListing
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

    if (updates.hours.length) {
      updates.hours.listing_id = sessionStorage.getItem('currentListing')
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
          updates.business_description.listing_id = sessionStorage.getItem('currentListing'); 
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
        myAxios
          .put("http://localhost:3000/api/updatedescription", updates.business_description)
          .then(resp => {
          console.log(resp)
          })
          .catch(err => {
            console.log(err)
          })
      })

      }   
  


  });
});
