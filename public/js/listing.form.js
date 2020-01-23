$(document).ready(function () {

    $('select.dropdown')
        .dropdown();

    const hours = ['12:00 am', '1:00 am', '2:00 am', '3:00 am', '4:00 am', '5:00 am', '6:00 am', '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm', '11:00 pm'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const categories = ['Dermatologist', 'Hair Care Salons', 'Hair Loss / Hair Care Products & Treatments', 'Hair Replacement & Hair Systems', 'Laser Therapy', 'Medial / Hair Transplants', 'Trichologist', 'Wigs, Extensions, Hair Additions']
    const socialMedia = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'Google +']
    const openingHoursField = document.querySelector('#opening-hours-field');
    const closingHoursField = document.querySelector('#closing-hours-field')

    days.forEach(day => {
        const field = document.createElement('div')
        field.className = 'field'
        field.id = day;

        const label = document.createElement('label')
        label.textContent = day

        const select = document.createElement('select')
        select.className = day + ' ui search dropdown'

        const options = hours.map((hour, index) => {
            return option = new Option(hour, index)

        })

        openingHoursField.appendChild(field)
        field.appendChild(label)
        label.appendChild(select)
        options.forEach(option => {
            select.append(option)
        })
    })
    days.forEach(day => {
        const field = document.createElement('div')
        field.id = day;
        field.className = 'field'

        const label = document.createElement('label')
        label.textContent = day

        const select = document.createElement('select')
        select.className = day + ' ui search dropdown'

        const options = hours.map((hour, index) => {
            return option = new Option(hour, index)

        })
        closingHoursField.appendChild(field)
        field.appendChild(select)
        options.forEach(option => {
            select.append(option)
        })
    })

    // appending category select
    const categoryField = document.querySelector('#category-field');
    
    const categoryLabel = document.createElement('label')
    categoryLabel.textContent = 'Category'; 
    categoryField.appendChild(categoryLabel)

    const categorySelect = document.createElement('select')
    categorySelect.className = ' ui search dropdown'
    categoryField.appendChild(categorySelect)

    const categoryOptions = categories.map(category => {
        return option = new Option(category, category)
    })

    categoryOptions.forEach(option => {
        categorySelect.append(option)
    })

    const smSelector = document.createElement('select')
    smSelector.className = 'smSelect'
    $( '#social-media' ).append(smSelector); 

    const smOptions = socialMedia.map(sm => {
        let smOption = new Option(sm, sm)
        smOption.className = 'smOption'
        return smOption
    })

    smOptions.forEach(sm => {
        smSelector.append(sm)
    })

    socialMedia.map(sm => {

        const field = document.createElement('div')
        field.className = 'field'
        field.id = sm;
        $(field).css('display', 'none')

        const label = document.createElement('label')
        label.textContent = sm

        const input = document.createElement('input')
        input.id = sm
        input.type = 'text'

        const smDiv = $( '#social-media' )

        smDiv.append(field); 
        field.append(label)
        label.append(input)
        
    })

    $('body').on('change', '.smSelect', function(e) {
        const toShow = document.querySelector(`#${e.target.value}`)
        $(toShow).css('display', 'block')
      });



    



    








})