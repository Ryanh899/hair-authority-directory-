$(document).ready(function () {
    // grabbing elements 
    const form1 = document.querySelector('form#form-1')
    const form2 = document.querySelector('form#form-2')
    const form3 = document.querySelector('form#form-3')
    const breadCrumb = document.querySelector('#footer')
    const submitButton = document.querySelector('#submit')

    const finalForm = {}

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
        label.textContent = day;
        label.id = 'labels-1'
        $(label).css('font-size', '16px')

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

    // first submit (business title and description)
    $('body').on('click', '#submit1', function () {
        event.preventDefault();
        const formData = new FormData(form1);
        console.log(...formData)
        if (formData.get('businessTitle') && formData.get('businessDescription')) {
            finalForm.businessTitle = formData.get('businessTitle')
            finalForm.businessDescription = formData.get('businessDescription')
            $(form1).css('display', 'none')
            $(form2).css('display', 'block')
            $('#businessTitle').css('color', 'black')
            $('#businessTitle').css('font-weight', '100')
            console.log(finalForm)
        } else {
            alert('Please Fill Out all info')
        }

    })

    //second submit (business storefront if applicable)
    $('body').on('click', '#submit1', function () {
        event.preventDefault();
        const formData = new FormData(form1);
        console.log(...formData)
        if (formData.get('businessTitle') && formData.get('businessDescription')) {
            finalForm.businessTitle = formData.get('businessTitle')
            finalForm.businessDescription = formData.get('businessDescription')
            $(form1).css('display', 'none')
            $(form2).css('display', 'block')
            $('#businessTitle').css('color', 'black')
            $('#businessTitle').css('font-weight', '100')
        } else {
            alert('Please Fill Out all info')
        }

    })

    $('body').on('click', '#submit2', function () {
        event.preventDefault();
        const formData = new FormData(form2);
        console.log(...formData)
        // final form 
        const neededData = {
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
            }
        }
        console.log(Object.values(neededData))

        Object.values(neededData).forEach(item => {
            if (item === "" || item === undefined) {
                alert('please fill out all info')
            } else {
                finalForm.streetAddress = formData.get("streetAddress"),
                    finalForm.city = formData.get("city"),
                    finalForm.state = formData.get("state"),
                    finalForm.zip = formData.get("zip"),
                    finalForm.hours = {
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
                    };

                $(form2).css('display', 'none')
                $(form3).css('display', 'block')
                $('#storefrontInfo').css('color', 'black')
                $('#storefrontInfo').css('font-weight', 100)
            }
        })



    })
})