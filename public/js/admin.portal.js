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
      // return authHelper.logOut("./sign-in.html");
    } else {
      return Promise.reject(error);
    }
  }
);
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
const PROD_API_URL = 'ec2-54-90-69-186.compute-1.amazonaws.com/api/'
const API_URL = "http://localhost:3000/api/";
const ADMIN_URL = "http://localhost:3000/admin/";

const categories = [
  { title: "Dermatologist" },
  { title: "Hair Care Salons" },
  { title: "Hair Loss / Hair Care Products & Treatments" },
  { title: "Hair Replacement & Hair Systems" },
  { title: "Laser Therapy" },
  { title: "Medical / Hair Transplants" },
  { title: "Trichologist" },
  { title: "Medical Hair Restoration" },
  { title: "Wigs / Extensions & Hair Additions" },
  { title: "The Hair Club", abbreviation: "" },
  { title: "ARTAS Robotic Hair Restoration System" },
  { title: "World Trichology Society", abbreviation: "Trichologist" },
  {
    title: "The International Society of Hair Restoration Surgery (ISHRS)",
    abbreviation: "ISHRS"
  }
];

function appendPendingListings (listings, loader, page) {
  $(page).empty()
  if (listings.length !== 0) {
    listings.forEach(listing => {
      let plan; 
          listing.subscription ? plan = listing.subscription.plan_code : undefined
      $(page)
        .append(`<tr>
        <td style="width: 20%"><a id="${listing.id}"  class="pendingTitle" >${listing.business_title}</a></td>
        <td style="width: 20%" class="table-category">${listing.category || ''}</td>
        <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
        <td style="width: 20%">${plan || 'N/A'}</td>
        <td style="width: 20%">${listing.date_published}</td>
      </tr>`);
    });
    $(loader).css('display', 'none')
  } else {
    console.log('nothin')
    $(loader).css('display', 'none')
  }
}

function appendListings (listings, loader, page, arr) {
  $(page).empty()
  if (listings.length !== 0) {
    listings.forEach(listing => {
      let plan; 
          listing.subscription ? plan = listing.subscription.plan_code : undefined
      $(page)
        .append(`<tr>
        <td style="width: 20%"><a id="${listing.id}"  class="listingTitle" >${listing.business_title}</a></td>
        <td style="width: 20%" class="table-category">${listing.category || ''}</td>
        <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
        <td style="width: 20%">${plan || 'N/A'}</td>
        <td style="width: 20%">${listing.date_published}</td>
      </tr>`);
      if (arr) {
        arr.push(listing)
      }
    });
    // $(loader).css('display', 'none')
  } else {
    console.log('nothin')
    $(loader).css('display', 'none')
  }
}

function getPendingListings(loader, page, text, pendingArr) {
 
  myAxios
    .get(ADMIN_URL + "pendingListings")
    .then(response => {
      const listings = response.data;
      console.log(response);
      // $(loader).css("display", "none");
      // $(page).fadeIn();
      if (listings.length !== 0) {
        listings.forEach(listing => {
          let plan; 
          listing.subscription ? plan = listing.subscription.plan_code : undefined
          $(page)
            .append(`<tr>
            <td style="width: 20%" ><a id="${listing.id}"  class="pendingTitle" >${listing.business_title}</a></td>
            <td style="width: 20%" class="table-category">${listing.category || ''}</td>
            <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
            <td style="width: 20%">${plan || 'N/A'}</td>
            <td style="width: 20%">${listing.date_published}</td>
          </tr>`);
          pendingArr.push(listing)
        });
        $(loader).css('display', 'none')
      } else {
        console.log('nothin')
        $(loader).css('display', 'none')
        $(text).css("display", '');
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getAllListings(loader, page, listingsArr) {
 
  myAxios
    .get(ADMIN_URL + "allListings")
    .then(response => {
      const listings = response.data;
      console.log(response);
      // $(loader).css("display", "none");
      // $(page).fadeIn();
      if (listings.length !== 0) {
        listings.forEach(listing => {
          if (listing !== null) {
            let plan; 
          listing.subscription ? plan = listing.subscription.plan_code : undefined
          $(page)
            .append(`<tr>
            <td style="width: 20%" ><a id="${listing.id}"  class="listingTitle" >${listing.business_title}</a></td>
            <td style="width: 20%" >${listing.category || ''}</td>
            <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
            <td style="width: 20%">${plan || 'N/A'}</td>
            <td style="width: 20%">${listing.date_published}</td>
          </tr>`);
          listingsArr.push(listing)
          }
        }); 
        $(loader).css('display', 'none')
      } else {
        console.log('nothin')
        $(loader).css('display', 'none')
        // $(text).css("display", '');
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function listingSearch (logoSearch, allLoader, allDiv, listings, page, pendingListings, pendingLoader, pendingDiv) {
  
  const pendingSearch = sessionStorage.getItem('adminSearchQuery_pending');
  const listingSearch = sessionStorage.getItem('adminSearchQuery');
  if (listingSearch) {
  $("#all-table tr").remove();
  let search = listingSearch
  let category = ""; 
  categories.forEach(item => {
    if (search && item.title.toLowerCase() === search.toLowerCase()) {
      category = search;
      }
  });
 
  if (category === "" && !logoSearch) {
    myAxios
      .get(
        ADMIN_URL + "search/" + search 
      )
      .then(response => {
        let allListings = response.data
        console.log(response);
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location);
        } else {
          appendListings(allListings, allLoader, allDiv, listings)
        }
      })
      .catch(err => {
        console.log(err);
      });
  } else if ( logoSearch ) {

    console.log(logoSearch)
    myAxios
      .get(
        ADMIN_URL +
          "search/logo/" +
          logoSearch 
          
      )
      .then(response => {
        let allListings = response.data
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location)
        } else {
            appendListings(allListings, allLoader, allDiv, listings)
  
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    let newSearch = category.replace(/\//g, '+');
    console.log(newSearch)
    myAxios
      .get(
        ADMIN_URL +
          "search/category/" +
          newSearch 
      )
      .then(response => {
        let allListings = response.data
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location)
        } else {
          appendListings(allListings, allLoader, allDiv, listings)
       
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  }
  } else if (pendingSearch) {
    $("#pending-table tr").remove();
    let category = ""; 
    let search = pendingSearch
    categories.forEach(item => {
      if (search && item.title.toLowerCase() === search.toLowerCase()) {
        category = search;
        }
    });
  
  if (category === "" && !logoSearch) {
    myAxios
      .get(
        ADMIN_URL + "searchpending/" + search 
      )
      .then(response => {
        let allListings = response.data
        console.log(response);
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location);
        } else {
          appendPendingListings(allListings, pendingLoader, pendingDiv )
        }
      })
      .catch(err => {
        console.log(err);
      });
  } else if ( logoSearch ) {

    console.log(logoSearch)
    myAxios
      .get(
        ADMIN_URL +
          "search/logo/" +
          logoSearch 
          
      )
      .then(response => {
        let allListings = response.data
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location)
        } else {
          appendPendingListings(allListings, pendingLoader, pendingDiv )
  
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    let newSearch = category.replace(/\//g, '+');
    console.log(newSearch)
    myAxios
      .get(
        ADMIN_URL +
          "search/category/" +
          newSearch 
      )
      .then(response => {
        let allListings = response.data
        console.log(response)
        if (response.data.length === 0 || response.status === 304) {
          $("#listings-column")
              .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
          $("#listings-column").append(
            `<p id="no-results-text" >There are no results for "${search}" in your area.`
          );
          $(allLoader).fadeOut();
          $(page).fadeIn();
          drawMap(location)
        } else {
          appendPendingListings(allListings, pendingLoader, pendingDiv )
       
        }
      })
      .catch(err => {
        console.log(err);
      })
      .catch(err => {
        console.log(err);
      });
  }
  }
  
}

function getClaims (claimsDiv, loader, claims) {
  myAxios
    .get(ADMIN_URL + "claims/pending")
    .then(response => {
      const listings = response.data;
      console.log(response);
      // $(loader).css("display", "none");
      // $(page).fadeIn();
      if (listings.length > 0) {
        listings.forEach(listing => {
          let plan; 
          listing.plan_code ? plan = listing.plan_code : plan = undefined
          console.log(plan)
          $(claimsDiv)
            .append(`<tr>
            <td style="width: 20%" ><a id="${listing.id}"  class="claimsTitle" >${listing.business_title}</a></td>
            <td style="width: 20%" class="table-category">${listing.category || ''}</td>
            <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
            <td style="width: 20%">${plan || 'N/A'}</td>
            <td style="width: 20%">${listing.date_published}</td>
          </tr>`);
          claims.push(listing)
        });
        // $(loader).css('display', 'none')
      } else {
        console.log('nothin')
        $(loader).css('display', 'none')
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getInactiveListings (inactiveTable, loader, inactiveListings) {
  myAxios
    .get(ADMIN_URL + "listings/inactive")
    .then(response => {
      const listings = response.data;
      console.log(response);
      // $(loader).css("display", "none");
      // $(page).fadeIn();
      if (listings.length > 0) {
        listings.forEach(listing => {
          let plan; 
          listing.plan_code ? plan = listing.plan_code : plan = undefined
          console.log(plan)
          $(inactiveTable)
            .append(`<tr>
            <td style="width: 20%" ><a id="${listing.id}"  class="inactiveTitle" >${listing.business_title}</a></td>
            <td style="width: 20%" class="table-category">${listing.category || ''}</td>
            <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
            <td style="width: 20%">${plan || 'N/A'}</td>
            <td style="width: 20%">${listing.date_published}</td>
          </tr>`);
          inactiveListings.push(listing)
        });
        // $(loader).css('display', 'none')
      } else {
        console.log('nothin')
        $(loader).css('display', 'none')
      }
    })
    .catch(err => {
      console.log(err);
    });
}

$(document).ready(function() {
  const loader = document.querySelector("div#loader-div");
  const page = document.querySelector("div#dashboard-container");
  const homeButton = document.querySelector("div#home-button");
  const pendingLoader = document.querySelector("div#pending-loader");
  const pendingDiv = document.querySelector("tbody#pending-table");
  const pendingText = document.querySelector('div#no-pending')
  const logoSearch = sessionStorage.getItem('logoSearch'); 
  const inactiveListingsTable = document.querySelector('tbody#inactiveListings-table')


  const allLoader = document.querySelector('div#all-loader')
  const allDiv = document.querySelector('tbody#all-table'); 

  const claimsDiv = document.querySelector('tbody#claims-table'); 

  let pendingListings = []; 
  let listings = []; 
  let claims = []; 
  const inactiveListings = []; 

  // remove pending and current from SS
  sessionStorage.removeItem('currentListing'); 
  sessionStorage.removeItem('pendingListing');


  $(loader).css("display", "none");
  $(pendingLoader).css("display", "none");
  $(".vertical.menu .item").tab();

  getAllListings(allLoader, allDiv, listings)

  if (sessionStorage.getItem('adminSearchQuery')) {
    // sessionStorage.removeItem('adminSearchQuery_pending')
    const search = sessionStorage.getItem('adminSearchQuery')
    listingSearch(logoSearch, allLoader, allDiv, listings, page, pendingListings, pendingLoader, pendingDiv)
}

if (sessionStorage.getItem('adminSearchQuery_pending')) {
  // sessionStorage.removeItem('adminSearchQuery')
  const search = sessionStorage.getItem('adminSearchQuery_pending')
  listingSearch(logoSearch, allLoader, allDiv, listings, page, pendingListings, pendingLoader, pendingDiv)
}

  // $(page).css("display", "none");
  // getPendingListings(loader, page);

  $('body').on('click', 'a.nav-link', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $("body").on("click", "#all-tab", function(event) {
    if (!listings.length) {
      $(pendingLoader).css("display", "");
      getAllListings(listings, allLoader, allDiv)
    } else {
      appendListings(listings, allLoader, allDiv)
    }
    $(allLoader).css('display', '')
  });

  $("body").on("click", "#pending-tab", function(event) {
    if (!pendingListings.length) {
      $(pendingLoader).css("display", "");
      getPendingListings(pendingLoader, pendingDiv, pendingText, pendingListings);
    } else {
      appendPendingListings(pendingListings, pendingLoader, pendingDiv )
    }
    
  });

  $("body").on("click", "#claims-tab", function(event) {
    if (!claims.length) {
      // $(pendingLoader).css("display", "");
      getClaims( claimsDiv, pendingLoader, claims);
    } else {
      appendListings(claims, pendingLoader, claimsDiv)
    }
    
  });

  $("body").on("click", "#inactiveListings-tab", function(event) {
    if (!inactiveListings.length) {
      // $(pendingLoader).css("display", "");
      getInactiveListings( inactiveListingsTable, pendingLoader, inactiveListings);
    } else {
      appendListings(inactiveListings, pendingLoader, inactiveListingsTable)
    }
    
  });

  $("body").on("click", "#home-button", function() {
    window.location.assign("index.html");
  });

  $("body").on("click", ".viewButton", function() {
    const id = $(this).attr("id");

    sessionStorage.setItem("currentAuthListing", id);
    window.location.assign("listing.auth.html");
  });

  $("body").on("click", "#newListing", function() {
    window.location.assign("listing.form.html");
  });

  $("body").on("click", "#home-icon-button", function() {
    window.location.assign("index.html");
  });

  $("body").on("click", "#logout-button", function() {
    sessionStorage.removeItem("token");
    window.location.assign("index.html");
  });

  $("body").on("click", ".verifyButton", function() {
    const id = $(this).attr("id");
    console.log(id);

    myAxios
      .post(ADMIN_URL + "verifyListing", { id: id })
      .then(response => {
        console.log(response);
        alert("user verified");
        $(this).fadeOut();
      })
      .catch(err => {
        console.log(err);
      });
  });

  $("body").on("click", "a.inactiveTitle", function(e) {
    const id = $(this).attr("id");
    console.log(id)
    console.log(listings)

    // filter arr of all listings on page to find clicked on listing and get the id
    let getCoords = inactiveListings.filter(x => x.id === id); 
    console.log(getCoords)
    // set the last window location to search 
    sessionStorage.setItem('lastLocation', 'search')
    // set the current listing lat and lng in SS
    sessionStorage.setItem('listing-lat', getCoords[0].lat)
    sessionStorage.setItem('listing-lng', getCoords[0].lng)
    // set full address for if no coords 
    sessionStorage.setItem('listing-address', getCoords[0].full_address)
    sessionStorage.removeItem('pendingListing')
    sessionStorage.removeItem('currentListing')
    sessionStorage.setItem("inactiveListing", id);
    window.location.assign("admin.listing.html");
  })

  $("body").on("click", "a.claimsTitle", function(e) {
    const id = $(this).attr("id");
    console.log(id)
    console.log(listings)

    // filter arr of all listings on page to find clicked on listing and get the id
    let getCoords = claims.filter(x => x.id === id); 
    console.log(getCoords)
    // set the last window location to search 
    sessionStorage.setItem('lastLocation', 'search')
    // set the current listing lat and lng in SS
    sessionStorage.setItem('listing-lat', getCoords[0].lat)
    sessionStorage.setItem('listing-lng', getCoords[0].lng)
    // set full address for if no coords 
    sessionStorage.setItem('listing-address', getCoords[0].full_address)
    sessionStorage.removeItem('pendingListing')
    sessionStorage.setItem("currentListing", id);
    window.location.assign("admin.listing.html");
  })

  $("body").on("click", "a.listingTitle", function(e) {
    const id = $(this).attr("id");
    console.log(id)
    console.log(listings)

    // filter arr of all listings on page to find clicked on listing and get the id
    let getCoords = listings.filter(x => x.id === id); 
    console.log(getCoords)
    // set the last window location to search 
    sessionStorage.setItem('lastLocation', 'search')
    // set the current listing lat and lng in SS
    sessionStorage.setItem('listing-lat', getCoords[0].lat)
    sessionStorage.setItem('listing-lng', getCoords[0].lng)
    // set full address for if no coords 
    sessionStorage.setItem('listing-address', getCoords[0].full_address)
    sessionStorage.removeItem('pendingListing')
    sessionStorage.setItem("currentListing", id);
    window.location.assign("admin.listing.html");
  })
    
    $("body").on("click", "a.pendingTitle", function(e) {
      const id = $(this).attr("id");
      console.log(id)
      // filter arr of all listings on page to find clicked on listing and get the id
      let getCoords = pendingListings.filter(x => x.id === id); 
      // set the last window location to search 
      sessionStorage.setItem('lastLocation', 'search')
      // set the current listing lat and lng in SS
      sessionStorage.setItem('listing-lat', getCoords[0].lat)
      sessionStorage.setItem('listing-lng', getCoords[0].lng)
      // set full address for if no coords 
      sessionStorage.setItem('listing-address', getCoords[0].full_address); 
      sessionStorage.removeItem("currentListing");
      sessionStorage.setItem("pendingListing", id);
      window.location.assign("admin.listing.html");
    });

    $("body").on("click", "#search-listings-button", function(e) {
      e.preventDefault()
      const search = $('#search-listings').val().trim();
      console.log(search);
  
      sessionStorage.setItem("adminSearchQuery", search);
      listingSearch(logoSearch, allLoader, allDiv, listings, page, pendingListings, pendingLoader, pendingDiv)

      // window.location.assign("search.listings.html");
    });

    $("body").on("click", "#search-pending-listings-button", function(e) {
      e.preventDefault()
      const search = $('input#search-pending-listings').val().trim();
      console.log(search);
  
      sessionStorage.setItem("adminSearchQuery_pending", search);
      listingSearch(logoSearch, allLoader, allDiv, listings, page, pendingListings, pendingLoader, pendingDiv)

      // window.location.assign("search.listings.html");
    });



});

window.addEventListener('beforeunload', (event) => {
  sessionStorage.removeItem('adminSearchQuery')
  sessionStorage.removeItem('adminSearchQuery_pending')

});
