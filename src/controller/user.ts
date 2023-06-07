import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"
import { userSchema } from "../config/joiValidate"
const bcrypt = require('bcrypt');

// function for validating user data
const validateUser = (userObj: object): string => {

    let value = userSchema.validate(userObj)
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
            updatedAt: date
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