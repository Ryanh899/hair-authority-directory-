const Joi = require('@hapi/joi'); 

const schema = Joi.object({
    businessTitle: Joi.string()
        .min(2)
        .max(30)
        .required(),

    businessSubtitle: Joi.string(),

    streetAddress: Joi.string(), 

    city: Joi.string(), 

    state: Joi.string(), 

    zip: Joi.string(), 

    website: Joi.string(), 

    phone: Joi.string(), 

    email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }), 

    extraInfo: Joi.string(), 

})

const validateForm = async function (formData) {
    try {
        const value = await schema.validateAsync(formData);
    }
    catch (err) { console.log(err) }
}


module.exports = validateForm