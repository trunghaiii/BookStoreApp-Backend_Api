import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');

// function for generateing jwt token
interface ItokenData {
    id: any,
    email: string,
    phone: string,
    fullName: string,
    role: string,
    avatar: string

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
        id: emailFound[0]._id,
        email: emailFound[0].email,
        phone: emailFound[0].phone,
        fullName: emailFound[0].fullName,
        role: emailFound[0].role,
        avatar: emailFound[0].avatar
    })

    // 4. update refesh token to db and return result to front end
    try {
        let result = await User.updateOne({ email }, { refreshToken: token.refresh_token })

        // set cookies
        res.cookie('refresh_token', token.refresh_token, {
            maxAge: 86400000, // Cookie expiration time in milliseconds (24h)
            httpOnly: true, // Restrict access to the cookie from client-side JavaScript
            secure: false, // Only send the cookie over HTTPS
            //sameSite: 'strict' // Only send the cookie for same-site requests
        });

        res.cookie('user_id', emailFound[0]._id, {
            maxAge: 86400000, // Cookie expiration time in milliseconds (24h)
            httpOnly: true, // Restrict access to the cookie from client-side JavaScript
            secure: false, // Only send the cookie over HTTPS
            //sameSite: 'strict' // Only send the cookie for same-site requests
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

export const getAccount = async (req: express.Request, res: express.Response) => {
    // console.log(req.headers.authorization);
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]

        try {

            // 2. verify and decode accesstoken to get user information
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
            //console.log(decoded);

            // 3. return user information for front end
            return res.status(200).json({
                errorMessage: "",
                errorCode: 0,
                data: {
                    user: decoded.data
                }
            })

        } catch (error) {
            return res.status(401).json({
                errorMessage: "Something wrong with your access token(invalid,expired,...)",
                errorCode: -1,
                data: ""
            })

        }

    }

    res.send("Get account enpoint ready!!!")
}

export const postLogOut = async (req: express.Request, res: express.Response) => {
    // 1. verify and decode the access token to get user infomation
    if (req.headers.authorization) {
        let access_token = req.headers.authorization.split(' ')[1]

        let userData;
        try {
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
            userData = decoded;

        } catch (error) {
            return res.status(401).json({
                errorMessage: "Something wrong with your access token(invalid,expired,...)",
                errorCode: -1,
                data: ""
            })

        }
        // 2. delete cookies:
        res.clearCookie('refresh_token');
        // 3. delete the refresh token of user in the database:
        const userId = userData.data.id;
        //console.log(userId);

        try {
            const response = await User.findByIdAndUpdate(userId, { refreshToken: '' })

            return res.status(200).json({
                errorMessage: "LogOut Successfully!!!",
                errorCode: 0,
                data: ""
            })
        } catch (error) {
            return res.status(400).json({
                errorMessage: "Something wrong with delete the refresh token of user in the database",
                errorCode: -1,
                data: ""
            })
            // console.log(error);

        }

    }
    // res.send("logouttt")
}

export const getRefreshToken = async (req: express.Request, res: express.Response) => {
    let refresh_token = req.cookies.refresh_token;
    let user_id = req.cookies.user_id;

    // 0. find the user data (latest) in the DB
    let latestUserData: any;
    try {
        let response = await User.findById(user_id);
        latestUserData = {
            id: response?._id,
            email: response?.email,
            phone: response?.phone,
            fullName: response?.fullName,
            role: response?.role,
            avatar: response?.avatar
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with find the user data (latest) in the DB",
            errorCode: -1,
            data: ""
        })
    }
    // 1. verify and decode the refresh token to get user infomation
    let userData;
    try {
        const decoded = await jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY);
        userData = latestUserData;

    } catch (error) {
        return res.status(401).json({
            errorMessage: "Something wrong with your refresh token(invalid,expired,...)",
            errorCode: -1,
            data: ""
        })

    }

    // 2. generate new pair of access token and refresh token
    let token = generateToken(userData)

    // 3. set cookies with new refresh token
    res.cookie('refresh_token', token.refresh_token, {
        maxAge: 86400000, // Cookie expiration time in milliseconds (24h)
        httpOnly: true, // Restrict access to the cookie from client-side JavaScript
        secure: false, // Only send the cookie over HTTPS
        //sameSite: 'strict' // Only send the cookie for same-site requests
    });
    // 4. send access token back to front end
    return res.status(200).json({
        errorMessage: "",
        errorCode: 0,
        data: {
            access_token: token.access_token,
            user: userData
        }
    })
    console.log(token);



    res.send("refresh toeknnnn")
}