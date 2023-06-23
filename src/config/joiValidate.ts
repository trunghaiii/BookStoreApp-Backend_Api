import Joi from 'joi'

export const userSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    phone: Joi.string()
        .required(),

    userImage: Joi.any()

})

export const UpdateUserSchema = Joi.object({
    _id: Joi.any(),
    fullName: Joi.string()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    phone: Joi.string()
        .required(),

    role: Joi.string()
        .required(),

})