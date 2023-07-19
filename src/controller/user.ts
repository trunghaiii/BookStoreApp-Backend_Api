import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"
import { Book } from "../db/book"
import { Comment } from "../db/comment"
import { userSchema, UpdateUserSchema } from "../config/joiValidate"
const { cloudinary } = require("../cloudinary/index")
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

    //2. check if email already exist in DB:

    try {

        let emailFound = await User.find({ email: req.body.email })

        if (emailFound.length > 0 && emailFound[0].email !== req.body.email) {
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

export const deleteUser = async (req: express.Request, res: express.Response) => {

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


    // 1. delete user with specific id in the database | delete user avatar image on cloud

    try {
        let response = await User.findByIdAndRemove(req.query._id)
        if (response?.avatar) {
            const rawUrl: string = response?.avatar;
            const customizeUrl: string = ("BookStoreApp" + rawUrl.split("/BookStoreApp")[1]).split(".")[0]
            // delete avatar image on cloudinary
            await cloudinary.uploader.destroy(customizeUrl)
        }


    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with delete user in the database | delete user avatar image on cloud",
            errorCode: -1,
            data: ""
        })

    }

    // 2. delete comments associated with deleted user 
    try {

        // find all comments id associated with deleted user
        let response = await Comment.find({ owner: req.query._id }).select('_id')

        for (let i = 0; i < response.length; i++) {
            //delete comment
            let commentResponse = await Comment.findByIdAndRemove(response[i]._id)
            // find book id by comment id:
            let bookResponse = await Book.find({ comments: { $in: [response[i]._id] } }).select("_id")
            // delete comment reference in Book Database
            let commentInBookResponse = await Book.findByIdAndUpdate(
                bookResponse[0]._id,
                { $pull: { comments: response[i]._id } })
        }

        return res.status(200).json({
            errorMessage: "Delete User Successfully!!!!",
            errorCode: 0,
            data: response
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with delete comments associated with deleted user ",
            errorCode: -1,
            data: ""
        })

    }
    //res.send("delete user")
}

export const putUpdateUserInfo = async (req: express.Request, res: express.Response) => {

    // 0. verify access token
    let accountUser: any;
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
            accountUser = decoded
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

    // 1. Update new User Data to the database:
    let date = new Date().toJSON();
    // if there is update image
    if (req.file) {
        // if user already has avatar image
        if (accountUser.data.avatar) {

            //delete user avatar image on cloud
            try {
                const rawUrl: string = accountUser.data.avatar;
                const customizeUrl: string = ("BookStoreApp" + rawUrl.split("/BookStoreApp")[1]).split(".")[0]
                // delete avatar image on cloudinary
                await cloudinary.uploader.destroy(customizeUrl)
            } catch (error) {
                return res.status(400).json({
                    errorMessage: "Something wrong with delete user avatar image on cloud",
                    errorCode: -1,
                    data: ""
                })
            }

        }

        // Update new User Data to the database with image!

        try {
            let response = await User.findByIdAndUpdate(accountUser.data.id,
                {
                    fullName: req.body.userName,
                    phone: req.body.phone,
                    avatar: req.file.path,
                    updatedAt: date
                })
            return res.status(200).json({
                errorMessage: "Update User info successfully!!!",
                errorCode: 0,
                data: {
                    fullName: req.body.userName,
                    phone: req.body.phone,
                    avatar: req.file.path
                }
            })
        } catch (error) {
            return res.status(400).json({
                errorMessage: "Something wrong with Update new User Data to the database with image",
                errorCode: -1,
                data: ""
            })
        }

    } else {
        // Update new User Data to the database withoout image!

        try {
            let response = await User.findByIdAndUpdate(accountUser.data.id,
                {
                    fullName: req.body.userName,
                    phone: req.body.phone,
                    updatedAt: date
                })
            return res.status(200).json({
                errorMessage: "Update User info successfully!!!",
                errorCode: 0,
                data: {
                    fullName: req.body.userName,
                    phone: req.body.phone,
                    avatar: ""
                }
            })
        } catch (error) {
            return res.status(400).json({
                errorMessage: "Something wrong with Update new User Data to the database without image",
                errorCode: -1,
                data: ""
            })
        }
    }
    //console.log(accountUser);

    // console.log(req.body);
    // console.log(req.file);


    res.send("putUpdateUserInfo")
}

export const putUpdatePassword = async (req: express.Request, res: express.Response) => {

    // 0. verify access token
    let accountUser: any;
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
            accountUser = decoded
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

    // 1. check if old password is correct:

    // find hashpassword based on user id:
    let oldHashPassword: any;
    try {
        let user = await User.findById(accountUser.data.id)
        oldHashPassword = user?.password
    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with find hashpassword based on user id",
            errorCode: -1,
            data: ""
        })
    }
    // check if old password is correct (match)
    try {
        const match = await bcrypt.compare(req.body.oldPassword, oldHashPassword)
        if (match === false) {
            return res.status(400).json({
                errorMessage: "Your Old password you typed is Incorrect!!!",
                errorCode: -1,
                data: ""
            })
        }
    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with check if old password is correct",
            errorCode: -1,
            data: ""
        })
    }


    //2. encrypt password:
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
    // 3. Update new password to the database:
    let date = new Date().toJSON();
    try {
        let response = await User.findByIdAndUpdate(accountUser.data.id,
            {
                password: hashPassword,
                updatedAt: date
            })
        return res.status(200).json({
            errorMessage: "Update User Password successfully!!!",
            errorCode: 0,
            data: ""
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with Update new password to the database",
            errorCode: -1,
            data: ""
        })
    }

    // console.log(accountUser);

    res.send("putUpdatePassword")
}