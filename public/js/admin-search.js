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
  
  function appendPendingListings (listings, loader, page) {
    if (listings.length !== 0) {
      listings.forEach(listing => {
        $(page)
          .append(`<tr>
          <td style="width: 20%"><a id="${listing.id}"  class="pendingTitle" >${listing.business_title}</a></td>
          <td style="width: 20%" class="table-category">${listing.category}</td>
          <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
          <td style="width: 20%">${listing.business_title}</td>
          <td style="width: 20%">${listing.date_published}</td>
        </tr>`);
      });
      $(loader).css('display', 'none')
    } else {
      console.log('nothin')
      $(loader).css('display', 'none')
    }
  }
  
  function appendListings (listings, loader, page) {
    if (listings.length !== 0) {
      listings.forEach(listing => {
        $(page)
          .html(`<tr>
          <td style="width: 20%"><a id="${listing.id}"  class="pendingTitle" >${listing.business_title}</a></td>
          <td style="width: 20%" class="table-category">${listing.category}</td>
          <td style="width: 20%">${listing.professional_id || 'N/A'}</td>
          <td style="width: 20%">${listing.business_title}</td>
          <td style="width: 20%">${listing.date_published}</td>
        </tr>`);
      });
      $(loader).css('display', 'none')
    } else {
      console.log('nothin')
      $(loader).css('display', 'none')
    }
  }
  
  

  function listingSearch (search, logoSearch, allLoader, allDiv) {
    $("#all-table tr").remove();

    let category=''
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
          allListings = response.data
          console.log(response);
          if (response.data.length === 0 || response.status === 304) {
            $("#listings-column")
                .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
            $("#listings-column").append(
              `<p id="no-results-text" >There are no results for "${search}" in your area.`
            );
            $(loader).fadeOut();
            $(page).fadeIn();
            drawMap(location);
          } else {
            appendListings(response.data, allLoader, allDiv)
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
          allListings = response.data
          console.log(response)
          if (response.data.length === 0 || response.status === 304) {
            $("#listings-column")
                .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
            $("#listings-column").append(
              `<p id="no-results-text" >There are no results for "${search}" in your area.`
            );
            $(loader).fadeOut();
            $(page).fadeIn();
            drawMap(location)
          } else {
              appendListings(response.data, allLoader, allDiv)
    
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
          allListings = response.data
          console.log(response)
          if (response.data.length === 0 || response.status === 304) {
            $("#listings-column")
                .append(`<p id="listing-column-title" >Search results for "${search}"</p>`)
            $("#listings-column").append(
              `<p id="no-results-text" >There are no results for "${search}" in your area.`
            );
            $(loader).fadeOut();
            $(page).fadeIn();
            drawMap(location)
          } else {
            appendListings(response.data, allLoader, allDiv)
         
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

$(document).ready(function () {
    // check if it is a category
    const allLoader = document.querySelector('div#all-loader')
    const allDiv = document.querySelector('tbody#all-table'); 
    let listings = []; 

    if (sessionStorage.getItem('searchQuery')) {
        const search = sessionStorage.getItem('searchQuery')
        listingSearch(search, logoSearch, allLoader, allDiv)
    }


    
    
})