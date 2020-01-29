var myAxios = axios.create({
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
    }
});
myAxios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response.status === 401) {
            return authHelper.logOut("./sign-in.html");
        } else {
            return Promise.reject(error);
        }
    }
);
const API_URL = 'http://localhost:3000/api/'

$(document).ready(function () {
    // get listing
    myAxios.get(API_URL + 'listing/' + localStorage.getItem('listingId'))
        .then(response => {
            const listing = response.data

            // append name
            const name = document.createElement('p')
            name.className = 'h2'
            $(name).css('display', 'inline-block')
            $(name).css('color', 'white')
            $(name).css('font-weight', 300)
            name.textContent = listing.business_title
            $('#nav-welcome').append(name)

            // let label = document.createElement('label')
            class Field {
                constructor(name) {}

                makeField(name) {
                    let field = document.createElement('div')
                    field.className = 'field'
                    field.id = name
                    return field
                }
            }

            class Label {
                constructor(name) {
                    this.name = name
                }

                makeLabel(name) {
                    let label = document.createElement('label')
                    label.id = `${name}-label`
                    label.textContent = `${name}`
                    return label
                }
            }

            class Input {
                constructor(name) {

                }

                makeInput(name, placeholder) {
                    let input = document.createElement('input')
                    input.className = 'ui input'
                    input.name = name
                    input.id = name
                    input.placeholder = placeholder
                    return input
                }
            }

            // Object.keys(listing).map(key => {
            //     console.log(key)
            //     let label = new Label(key)
            //     let field = new Field(key)
            //     $( '.form-container' ).append(field.makeField(key))
            //     let thisField = document.querySelector(`#${key}`)
            //     thisField.appendChild(label.makeLabel(key))

            // })

            // Object.values(listing).map(value => {
            //     let theLabel = document.querySelector(`#${listing[value]}-label`)
            //     let input = new Input(value)
            //     theLabel.append(input.makeInput(value))


            // })





        }).catch(err => {
            console.log(err)
        })
})