import express from "express"
import mongoose from "mongoose";
import { Book } from "../db/book"
import { Comment } from "../db/comment"
import { User } from "../db/user"
import { bookSchema, updateBookSchema, commentSchema } from "../config/joiValidate"
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

const validateComment = (commentObj: object): string => {

    let value = commentSchema.validate(commentObj)
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

    let { name, author, genre, genreList, fromPrice, toPrice } = req.query;
    // // 1. Get number of user in the database:

    // convert genreList to Array
    let genreArr: string[] = []
    if (genreList) {
        genreArr = (genreList as string)?.split(",")
    }


    if (name || author || genre || genreArr.length !== 0 || fromPrice || toPrice) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""
        if (!fromPrice) fromPrice = ""
        if (!toPrice) toPrice = "Infinity"

        //console.log(typeof (name));

        // find the total number of users based on filtered fields
        if (genreArr.length !== 0) {
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i"), $in: genreArr },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i") },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
    if (name || author || genre || genreArr.length !== 0 || fromPrice || toPrice) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""
        if (!fromPrice) fromPrice = ""
        if (!toPrice) toPrice = "Infinity"

        if (genreArr.length !== 0) {
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i"), $in: genreArr },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i") },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
                }).skip((current - 1) * pageSize).limit(pageSize)
                bookData = response

            } catch (error) {
                return res.status(400).json({
                    errorMessage: "something wrong with get filtered book data based on pageSize and current got from front end",
                    errorCode: -1,
                    data: ""
                })

            }
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

    // 1. Delete comments in delete book:
    try {
        let bookResponse = await Book.findById(req.query.id).select("comments")

        for (let i = 0; i < bookResponse?.comments.length; i++) {
            let commentResponse = await Comment.findByIdAndRemove(bookResponse?.comments[i])
        }

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with Delete comments in delete book",
            errorCode: -1,
            data: ""
        })

    }
    // 2. delete book based on id | delete all images in imageUrlArr on cloudinary

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

export const getBookDetail = async (req: express.Request, res: express.Response) => {

    // get book detail by Id from database
    try {
        let response = await Book.findById(req.query.bookId)

        return res.status(200).json({
            errorMessage: "Get Book Detail successfully",
            errorCode: 0,
            data: response
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with Get Book Detail by Id",
            errorCode: -1,
            data: ""
        })

    }

    // res.send("getBookDetail getBookDetail")
}

export const getHomeBookPagination = async (req: express.Request, res: express.Response) => {

    let pages: number; // number of pages distributed for users number
    let total: number; // total number of users

    let { name, author, genre, genreList, fromPrice, toPrice } = req.query;

    // 1. Get number of user in the database:

    // convert genreList to Array
    let genreArr: string[] = []
    if (genreList) {
        genreArr = (genreList as string)?.split(",")
    }


    if (name || author || genre || genreArr.length !== 0 || fromPrice || toPrice) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""
        if (!fromPrice) fromPrice = ""
        if (!toPrice) toPrice = "Infinity"

        //console.log(typeof (name));

        // find the total number of users based on filtered fields
        if (genreArr.length !== 0) {
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i"), $in: genreArr },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i") },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
    if (name || author || genre || genreArr.length !== 0 || fromPrice || toPrice) {
        if (!name) name = ""
        if (!author) author = ""
        if (!genre) genre = ""
        if (!fromPrice) fromPrice = ""
        if (!toPrice) toPrice = "Infinity"

        if (genreArr.length !== 0) {
            try {
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i"), $in: genreArr },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
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
                let response = await Book.find({
                    bookName: { $regex: new RegExp(String(name), "i") },
                    author: { $regex: new RegExp(String(author), "i") },
                    category: { $regex: new RegExp(String(genre), "i") },
                    price: { $gte: Number(fromPrice), $lte: Number(toPrice) }
                }).skip((current - 1) * pageSize).limit(pageSize)
                bookData = response

            } catch (error) {
                return res.status(400).json({
                    errorMessage: "something wrong with get filtered book data based on pageSize and current got from front end",
                    errorCode: -1,
                    data: ""
                })

            }
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




}

export const postComment = async (req: express.Request, res: express.Response) => {

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

    const { bookId, userId, content, rate } = req.query;

    //1. validate comment data with joi
    try {
        let error = await validateComment({ bookId, userId, content, rate })
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
            errorMessage: "something wrong with validate comment data with joi",
            errorCode: -1,
            data: ""
        })
    }
    // 2. save comment content to the database
    try {
        // find book with bookId in DB
        let book = await Book.findById(bookId)
        // find user with userId in DB
        let user = await User.findById(userId)
        // create new comment
        let comment = new Comment({
            content: content,
            rate: Number(rate),
            owner: user
        })

        // push new comment to book comments arr
        book?.comments.push(comment)

        await book?.save()
        await comment.save()

        return res.status(200).json({
            errorMessage: "Create comment successfully!!!",
            errorCode: 0,
            data: ""
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with save comment content to the database",
            errorCode: -1,
            data: ""
        })

    }

    res.send("postComment postComment")
}

export const getComment = async (req: express.Request, res: express.Response) => {


    // 1. get comment detail by Book Id
    let commentInfo: any = []
    try {
        // find all comment of a book based on book ID
        let book = await Book.findById(req.query.bookId).populate('comments')

        // find owner of each comment and customize commentInfo ready to send to front end
        if (book && book.comments) {
            for (let i = 0; i < book.comments.length; i++) {
                let commentResponse = await Comment.findById(book.comments[i]._id).populate('owner')

                commentInfo.push({
                    content: commentResponse?.content,
                    rate: commentResponse?.rate,
                    commentId: commentResponse?._id,
                    ownerName: commentResponse?.owner.fullName,
                    ownerAvatar: commentResponse?.owner.avatar,
                    ownerId: commentResponse?.owner._id
                })
            }
        }



    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with finding comments based on book id",
            errorCode: -1,
            data: ""
        })

    }

    // 2. send data to front end
    return res.status(200).json({
        errorMessage: "Get comment Detail successfully!!!",
        errorCode: 0,
        data: commentInfo
    })

    res.send("getComment getComment")
}

export const deleteComment = async (req: express.Request, res: express.Response) => {

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

    // 1. delete comment and delete comment reference in Book Database

    try {
        //delete comment
        let commentResponse = await Comment.findByIdAndRemove(req.query.commentId)
        // delete comment reference in Book Database
        let commentInBookResponse = await Book.findByIdAndUpdate(
            req.query.bookId,
            { $pull: { comments: req.query.commentId } })

        return res.status(200).json({
            errorMessage: "Delete comment successfully!!!",
            errorCode: 0,
            data: ""
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with delete comment and delete comment reference in Book Database",
            errorCode: -1,
            data: ""
        })

    }

    res.send("deleteComment deleteComment")
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