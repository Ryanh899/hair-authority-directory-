// auth helper and axios interceptor 
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
    }, 
    zohoRedirectCheck () {
      const url = window.location.href.split('='); 
      const redirectId = url[1]; 
      if (redirectId) {
        return redirectId
      } else {
        return false
      }
    }
  };

// on ready
$(document).ready(function () {
    // hide loader
    $('#check-loader').css('display', 'none'); 

    let allListings; 

    // establish api url 
    // let API_URL = "http://ec2-34-201-189-88.compute-1.amazonaws.com/api/"
     let API_URL = "http://localhost:3000/api/";

    // add event listener for search button
    $('body').on('click', '#check-search', function () {
        // start loader + hide page

        // assign var to search input
        const search = $('#check-search-input').val().trim(); 
        console.log(search)
        if (search) {
            // show loader 
            $('#check-loader').css('display', 'none'); 



            myAxios
                .get(API_URL + 'listing/title/' + search)
                .then(response => {
                    console.log(response); 

                    // populate all listings 
                    allListings = response.data

                    response.data.forEach(listing => {
                        $("#results")
                          .html(`<div
                          style="margin-bottom: 1rem; background: #f8f8f8"
                          class="ui grid segment listingItem-search"
                          id="list-item"
                        >
                          <div style="padding: 1rem; padding-right: 0px;" class="row">
                            <div  class="five wide middle aligned column">
                              <div class="ui image" >
                                  <img 
                                  style="max-height: 200px;"
                                  class="ui rounded fluid image"
                                  src="https://ha-images-02.s3-us-west-1.amazonaws.com/${listing.feature_image || "placeholder.png"}"
                                />
                              </div>
                            </div>
                            <div class="eleven wide column">
                              <div class="ui grid">
                                  <div
                                  style="padding: 1rem 0rem 0rem .5rem;"
                                  class="ten wide column"
                                >
                                  <a href="#" id="${listing.id}" class="listingTitle-search">
                                    ${listing.business_title} <i class="tiny check circle icon" style="color: #1f7a8c;" ></i>
                                  </a>
                                  <p class="listingSubtitle-search">
                                    ${listing.category || "" }
                                  </p>
                                  
                                </div>
                                <div
                                class="six wide computer only column"
                              >
                                <p class="listing-info-text">
                                  <i style="color: #1f7a8c;" class="small phone icon" ></i>${listing.phone || "999-999-9999"}
                                </p>
                                <p class="listing-info-text">
                                  <i style="color: #1f7a8c;" class="location small arrow icon" ></i>${listing.city || listing.full_address}
                                </p>
                                <!-- <button style="margin-top: 1rem; background: #79bcb8; color: white; margin-right: 1.5rem;" class="ui right floated button">Preview</button> -->
                              </div>
                              
                              <div id="listing-tagline-search" class="fourteen wide column">
                                  ${listing.tagline} 
                              </div>
                              </div>
                              </div>
                            </div>
                        </div>`);
                      });

                    // hide loader 
                    $('#check-loader').css('display', 'none'); 
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            return alert('Invalid Entry')
           
        }
       
    })

    $("body").on("click", "a", function(e) {
        const id = $(this).attr("id");
        // filter arr of all listings on page to find clicked on listing and get the id
        let getCoords = allListings.filter(x => x.id === id); 
        // set the last window location to search 
        sessionStorage.setItem('lastLocation', 'search')
        // set the current listing lat and lng in SS
        sessionStorage.setItem('listing-lat', getCoords[0].lat)
        sessionStorage.setItem('listing-lng', getCoords[0].lng)
        // set full address for if no coords 
        sessionStorage.setItem('listing-address', getCoords[0].full_address)
        sessionStorage.setItem("currentListing", id);
        window.location.assign("listing.html");
      });
})