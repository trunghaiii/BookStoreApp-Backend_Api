import express from "express"
import mongoose from "mongoose";
import { Book } from "../db/book"
import { bookSchema, updateBookSchema } from "../config/joiValidate"
const { cloudinary } = require("../cloudinary/index")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const validateBook = (userObj: object): string => {

    let value = bookSchema.validate(userObj)
    if (value?.error?.details[0]?.message) {
        return value?.error?.details[0]?.message;
    }
    return ""
}

const validateUpdateBook = (userObj: object): string => {

    let value = updateBookSchema.validate(userObj)
    if (value?.error?.details[0]?.message) {
        return value?.error?.details[0]?.message;
    }
    return ""
}


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

export const postCreateBook = async (req: express.Request, res: express.Response) => {
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

    // console.log(req.body);
    // console.log(req.body.imageUrlArray.split(","));


    //1. build book data ready for upload:
    let date = new Date().toJSON();
    const { name, author, price, genre, quantity, sold, imageUrlArray } = req.body

    let imageData: string[] = []
    if (imageUrlArray) {
        imageData = imageUrlArray.split(",")
    }

    let bookData = {
        slider: imageData,
        bookName: name,
        author: author,
        price: +price,
        sold: +sold,
        quantity: +quantity,
        category: genre,
        createdAt: date,
        updatedAt: date,
    }

    //2. validate book data with joi
    try {
        let error = await validateBook(bookData)
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
            errorMessage: "something wrong with validate book data with joi",
            errorCode: -1,
            data: ""
        })
    }

    // 3. upload book data to the database:

    try {
        const book = new Book(bookData);
        await book.save();

        //console.log(user);

        return res.status(200).json({
            errorMessage: "Create a new book successfully",
            errorCode: 0,
            data: book
        })
    } catch (error) {
        //console.log(error);

        return res.status(400).json({
            errorMessage: "something wrong with save book data to the DB",
            errorCode: -1,
            data: ""
        })
    }

    // console.log("gg", req.body);
    // console.log("aaa", req.files);


    // res.send("postCreateBook postCreateBook")
}

export const getUploadImage = async (req: express.Request, res: express.Response) => {

    // // 0. verify access token
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

    // 1. upload image to cloudinary and send back the image url to front end
    if (req.file) {
        return res.status(200).json({
            errorMessage: "upload image file to cloudinary successfully!!",
            errorCode: 0,
            data: req.file.path
        })
    } else {
        return res.status(400).json({
            errorMessage: "Something wrong (possibly there is no file uploaded)",
            errorCode: -1,
            data: ""
        })
    }
    // console.log(req.file);

    // res.send(" getUploadImage getUploadImage")
}

export const postUpdateBook = async (req: express.Request, res: express.Response) => {

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

    // 1. build update book data ready for upload

    let date = new Date().toJSON();
    const { bookName, price, quantity, sold, id } = req.body;

    const updateBookData = {
        bookName,
        price: +price,
        quantity: +quantity,
        sold: +sold,
        updatedAt: date
    }

    //2. validate updatebook data with joi
    try {
        let error = await validateUpdateBook(updateBookData)
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
            errorMessage: "something wrong with validate updatebook data with joi",
            errorCode: -1,
            data: ""
        })
    }

    // 3. update book data in database:
    try {
        let response = await Book.findByIdAndUpdate(id, updateBookData)

        return res.status(200).json({
            errorMessage: "Update Book Successfully!!!",
            errorCode: 0,
            data: ""
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with update book data in database",
            errorCode: -1,
            data: ""
        })

    }

    // console.log(updateBookData, id);

    // res.send("postUpdateBook postUpdateBook")
}

export const deleteBook = async (req: express.Request, res: express.Response) => {

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


    // 1. delete book based on id | delete all images in imageUrlArr on cloudinary

    try {
        let response = await Book.findByIdAndRemove(req.query.id)

        if (response?.slider.length !== 0) {
            for (let i = 0; i < response?.slider.length; i++) {
                const rawUrl: string = response?.slider[i];
                const customizeUrl: string = ("BookStoreApp" + rawUrl.split("/BookStoreApp")[1]).split(".")[0]
                // delete avatar image on cloudinary
                await cloudinary.uploader.destroy(customizeUrl)
            }
        }

        // sent response to front end
        return res.status(200).json({
            errorMessage: "Delete Book Successfully!!!",
            errorCode: 0,
            data: response
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with delete book based on id | delete all images in imageUrlArr on cloudinary",
            errorCode: -1,
            data: ""
        })

    }

    //res.send("deleteBookdeleteBookdeleteBook")
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