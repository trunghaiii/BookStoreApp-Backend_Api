import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"
import { userSchema, UpdateUserSchema } from "../config/joiValidate"
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

// function for validating user data
const validateUser = (userObj: object): string => {

    let value = userSchema.validate(userObj)
    if (value?.error?.details[0]?.message) {
        return value?.error?.details[0]?.message;
    }
    return ""
}

const validateUpdateUser = (userObj: object): string => {

    let value = UpdateUserSchema.validate(userObj)
    if (value?.error?.details[0]?.message) {
        return value?.error?.details[0]?.message;
    }
    return ""
}

// function for encrypting password
const encryptPassword = (plainPassword: string): string => {
    const saltRounds: number = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(plainPassword, salt);

    if (hash) {
        return hash;
    }

    return ""
}

export const postRegisterUser = async (req: express.Request, res: express.Response) => {

    // 1. validate user data with joi
    try {
        let error = await validateUser(req.body)
        //console.log(">>>>", value);

        if (error) {
            return res.status(400).json({
                errorMessage: error,
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with validate user data with joi",
            errorCode: -1,
            data: ""
        })
    }

    //2. check if email already exist in DB:

    try {
        let emailFound = await User.find({ email: req.body.email })
        if (emailFound.length > 0) {
            return res.status(400).json({
                errorMessage: "Email already exist!!!",
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with check if email already exist in DB",
            errorCode: -1,
            data: ""
        })

    }

    // 3. encrypt password:
    let hashPassword: string
    try {
        hashPassword = await encryptPassword(req.body.password)
    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with encrypt password",
            errorCode: -1,
            data: ""
        })
    }

    // 4. save user info to the DB:

    let date = new Date().toJSON();
    const { fullName, email, password, phone } = req.body

    try {
        const user = new User({
            fullName: fullName,
            password: hashPassword,
            email: email,
            phone: phone,
            role: "USER",
            avatar: "",
            isActive: true,
            createdAt: date,
            updatedAt: date,
            refreshToken: ""
        });
        await user.save();

        //console.log(user);

        return res.status(200).json({
            errorMessage: "Register a new user successfully",
            errorCode: 0,
            data: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        })
    } catch (error) {
        //console.log(error);

        return res.status(400).json({
            errorMessage: "something wrong with save user info to the DB",
            errorCode: -1,
            data: ""
        })
    }


    //res.send("Hello World !!")
};
export const getUserPagination = async (req: express.Request, res: express.Response) => {

    let pages: number; // number of pages distributed for users number
    let total: number; // total number of users

    // 0. verify access token
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);

        } catch (error) {
            return res.status(401).json({
                errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
                errorCode: -1,
                data: ""
            })

        }

    } else {
        return res.status(401).json({
            errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
            errorCode: -1,
            data: ""
        })
    }

    let { name, email, phone } = req.query;
    // // 1. Get number of user in the database:

    if (name || email || phone) {
        if (!name) name = ""
        if (!email) email = ""
        if (!phone) phone = ""

        //console.log(typeof (name));

        // find the total number of users based on filtered fields
        try {
            let response = await User.find({
                fullName: { $regex: new RegExp(String(name), "i") },
                email: { $regex: new RegExp(String(email), "i") },
                phone: { $regex: new RegExp(String(phone), "i") }
            }).count()

            total = response


        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with Get number of user based on filtered fields in the database",
                errorCode: -1,
                data: ""
            })

        }
    } else {
        // find the total number of users based on nothing

        try {
            let response = await User.collection.count();
            total = response;

        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with Get number of user in the database",
                errorCode: -1,
                data: ""
            })

        }
    }


    // 2. calculate pages
    let pageSize: number = Number(req.query.pageSize);
    pages = Math.ceil(total / pageSize)


    // 3. getting user data based on pageSize and current got from front end:
    let current: number = Number(req.query.current);
    let userData
    if (name || email || phone) {
        if (!name) name = ""
        if (!email) email = ""
        if (!phone) phone = ""

        try {
            let response = await User.find({
                fullName: { $regex: new RegExp(String(name), "i") },
                email: { $regex: new RegExp(String(email), "i") },
                phone: { $regex: new RegExp(String(phone), "i") }
            }).skip((current - 1) * pageSize).limit(pageSize)
            userData = response

        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with get filtered user data based on pageSize and current got from front end",
                errorCode: -1,
                data: ""
            })

        }
    } else {
        try {
            let response = await User.find().skip((current - 1) * pageSize).limit(pageSize)
            userData = response

        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with get user data based on pageSize and current got from front end",
                errorCode: -1,
                data: ""
            })

        }
    }


    // 4. return data for front end:
    return res.status(200).json({
        errorMessage: "Get all user with pagination successfully",
        errorCode: 0,
        data: {
            meta: {
                current: current,
                pageSize: pageSize,
                pages: pages,
                total: total
            },
            result: userData
        }
    })


    //res.send("user paginate")
}


export const postCreateUser = async (req: express.Request, res: express.Response) => {

    // 0. verify access token
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);

        } catch (error) {
            return res.status(401).json({
                errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
                errorCode: -1,
                data: ""
            })

        }

    } else {
        return res.status(401).json({
            errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
            errorCode: -1,
            data: ""
        })
    }

    // 1. validate user data with joi
    try {
        let error = await validateUser(req.body)
        //console.log(">>>>", value);

        if (error) {
            return res.status(400).json({
                errorMessage: error,
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with validate user data with joi",
            errorCode: -1,
            data: ""
        })
    }

    //2. check if email already exist in DB:

    try {

        let emailFound = await User.find({ email: req.body.email })
        if (emailFound.length > 0) {
            return res.status(400).json({
                errorMessage: "Email already exist!!!",
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with check if email already exist in DB",
            errorCode: -1,
            data: ""
        })

    }

    // 3. encrypt password:
    let hashPassword: string
    try {
        hashPassword = await encryptPassword(req.body.password)

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with encrypt password",
            errorCode: -1,
            data: ""
        })
    }

    // 4. save user info with user image to the DB:

    let date = new Date().toJSON();
    const { fullName, email, password, phone } = req.body
    // console.log(req.file);


    try {
        const user = new User({
            fullName: fullName,
            password: hashPassword,
            email: email,
            phone: phone,
            role: "USER",
            avatar: req.file?.path || "",
            isActive: true,
            createdAt: date,
            updatedAt: date,
            refreshToken: ""
        });
        await user.save();

        //console.log(user);

        return res.status(200).json({
            errorMessage: "Create a new user successfully",
            errorCode: 0,
            data: user
        })
    } catch (error) {
        //console.log(error);

        return res.status(400).json({
            errorMessage: "something wrong with save user info with user image to the DB",
            errorCode: -1,
            data: ""
        })
    }


    // console.log("req.body", req.body);
    // console.log("req.file", req.file);

    // res.send("post create new user")
}

export const postUpdateUser = async (req: express.Request, res: express.Response) => {

    // 0. verify access token
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);

        } catch (error) {
            return res.status(401).json({
                errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
                errorCode: -1,
                data: ""
            })

        }

    } else {
        return res.status(401).json({
            errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
            errorCode: -1,
            data: ""
        })
    }

    // 1. validate user data with joi
    try {

        let error = await validateUpdateUser(req.body)
        //console.log(">>>>", value);

        if (error) {
            return res.status(400).json({
                errorMessage: error,
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with validate update user data with joi",
            errorCode: -1,
            data: ""
        })
    }

    // 3. update User data in database:
    let date = new Date().toJSON();
    try {
        let response = await User.findByIdAndUpdate(req.body._id, {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            updatedAt: date
        })

        return res.status(200).json({
            errorMessage: "Update User Successfully!!!",
            errorCode: 0,
            data: ""
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with update User data in database",
            errorCode: -1,
            data: ""
        })

    }
    //console.log(req.body);

    res.send("Put update User")
}