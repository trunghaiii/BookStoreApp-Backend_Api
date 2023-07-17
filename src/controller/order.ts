import express from "express"
import mongoose from "mongoose";
import { Book } from "../db/book"
import { Comment } from "../db/comment"
import { User } from "../db/user"
import { bookSchema, updateBookSchema, commentSchema } from "../config/joiValidate"
const { cloudinary } = require("../cloudinary/index")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

export const postOrder = async (req: express.Request, res: express.Response) => {

    // 0. verify access token
    // if (req.headers.authorization) {
    //     //1. get access token sent from front end
    //     let access_token = req.headers.authorization.split(' ')[1]

    //     try {
    //         // 2. verify accesstoken
    //         const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);

    //     } catch (error) {
    //         return res.status(401).json({
    //             errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
    //             errorCode: -1,
    //             data: ""
    //         })

    //     }

    // } else {
    //     return res.status(401).json({
    //         errorMessage: "Something wrong with your access token(invalid,expired,not exist...)",
    //         errorCode: -1,
    //         data: ""
    //     })
    // }

    res.send("post order")
}