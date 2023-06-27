import express from "express"
import mongoose from "mongoose";
import { Book } from "../db/book"
import { userSchema, UpdateUserSchema } from "../config/joiValidate"
const { cloudinary } = require("../cloudinary/index")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")


export const getBookPagination = async (req: express.Request, res: express.Response) => {

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

    let { name, author, genre } = req.query;
    // // 1. Get number of user in the database:


    if (name || author || genre) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""

        //console.log(typeof (name));

        // find the total number of users based on filtered fields
        try {
            let response = await Book.find({
                bookName: { $regex: new RegExp(String(name), "i") },
                author: { $regex: new RegExp(String(author), "i") },
                category: { $regex: new RegExp(String(genre), "i") }
            }).count()

            total = response


        } catch (error) {
            //console.log(error);

            return res.status(400).json({
                errorMessage: "something wrong with Get number of books based on filtered fields in the database",
                errorCode: -1,
                data: ""
            })

        }
    } else {
        // find the total number of books based on nothing

        try {
            let response = await Book.collection.count();
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


    // 3. getting book data based on pageSize and current got from front end:
    let current: number = Number(req.query.current);
    let bookData
    if (name || author || genre) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""

        try {
            let response = await Book.find({
                bookName: { $regex: new RegExp(String(name), "i") },
                author: { $regex: new RegExp(String(author), "i") },
                category: { $regex: new RegExp(String(genre), "i") }
            }).skip((current - 1) * pageSize).limit(pageSize)
            bookData = response

        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with get filtered book data based on pageSize and current got from front end",
                errorCode: -1,
                data: ""
            })

        }
    } else {
        try {
            let response = await Book.find().skip((current - 1) * pageSize).limit(pageSize)
            bookData = response

        } catch (error) {
            return res.status(400).json({
                errorMessage: "something wrong with get book data based on pageSize and current got from front end",
                errorCode: -1,
                data: ""
            })

        }
    }


    // 4. return data for front end:
    return res.status(200).json({
        errorMessage: "Get all books with pagination successfully",
        errorCode: 0,
        data: {
            meta: {
                current: current,
                pageSize: pageSize,
                pages: pages,
                total: total
            },
            result: bookData
        }
    })



    res.send("get book list paginationnn")
}




// let date = new Date().toJSON();

//     try {
//         const small = new Book({
//             thumbnail: "",
//             slider: [],
//             bookName: "Guitar Basics",
//             author: "Hai Tran",
//             price: 110,
//             sold: 100,
//             quantity: 150,
//             category: "Music",
//             createdAt: date,
//             updatedAt: date,
//         });
//         await small.save();
//     } catch (error) {
//         console.log(error);


//     }