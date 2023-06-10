import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');

// function for generateing jwt token
interface ItokenData {
    fullName: string,
    email: string,
    role: string

}
const generateToken = (tokenData: ItokenData) => {
    // console.log(">>>", process.env.ACCESS_TOKEN_KEY, process.env.REFRESH_TOKEN_KEY);

    let access_token = jwt.sign({
        data: tokenData
    }, process.env.ACCESS_TOKEN_KEY, { expiresIn: 60 * 60 });

    let refresh_token = jwt.sign({
        data: tokenData
    }, process.env.REFRESH_TOKEN_KEY, { expiresIn: 60 * 60 * 24 });

    return { access_token, refresh_token }

}

export const postLogin = async (req: express.Request, res: express.Response) => {
    let { email, password } = req.body;

    //console.log(email, password);
    //1. Check if email exist in the DB:
    let emailFound;
    try {
        //Check if email exist in the DB:
        emailFound = await User.find({ email })

        if (emailFound.length === 0) {
            return res.status(400).json({
                errorMessage: "Incorrect Email!!!",
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with Check if email exist in the DB ",
            errorCode: -1,
            data: ""
        })
    }

    // 2. Check if password match hashPassword in the DB:
    //console.log(emailFound);
    try {
        const passwordFound = await bcrypt.compare(password, emailFound[0].password)

        if (passwordFound === false) {
            return res.status(400).json({
                errorMessage: "Incorrect Password!!!",
                errorCode: -1,
                data: ""
            })
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with Check if password match hashPassword in the DB",
            errorCode: -1,
            data: ""
        })
    }

    // 3. create access token and refresh token
    interface ItokenData {
        access_token: string;
        refresh_token: string;
    }
    // generate token
    let token: ItokenData = generateToken({
        fullName: emailFound[0].fullName,
        email: emailFound[0].email,
        role: emailFound[0].role
    })

    // 4. update refesh token to db and return result to front end
    try {
        let result = await User.updateOne({ email }, { refreshToken: token.refresh_token })

        // set cookies
        res.cookie('refresh_token', token.refresh_token, {
            maxAge: 86400000, // Cookie expiration time in milliseconds (24h)
            httpOnly: true, // Restrict access to the cookie from client-side JavaScript
            secure: false, // Only send the cookie over HTTPS
            sameSite: 'strict' // Only send the cookie for same-site requests
        });

        return res.status(200).json({
            errorMessage: "Login Successfully!!!",
            errorCode: 0,
            data: {
                access_token: token.access_token,
                user: {
                    email: emailFound[0].email,
                    phone: emailFound[0].phone,
                    fullName: emailFound[0].fullName,
                    role: emailFound[0].role,
                    avatar: emailFound[0].avatar,
                    id: emailFound[0]._id
                }
            }
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with update refesh token in db",
            errorCode: -1,
            data: ""
        })
    }


    // res.send("post login")

};