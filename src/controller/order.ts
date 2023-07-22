import express from "express"
import mongoose from "mongoose";
import { Order } from "../db/order"
import { orderSchema } from "../config/joiValidate"
const jwt = require("jsonwebtoken")

const validateOrder = (userObj: object): string => {

    let value = orderSchema.validate(userObj)
    if (value?.error?.details[0]?.message) {
        return value?.error?.details[0]?.message;
    }
    return ""
}

export const postOrder = async (req: express.Request, res: express.Response) => {

    //0. verify access token
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

    // 1. validate order data with Joi
    try {
        let error = await validateOrder(req.body)
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
            errorMessage: "something wrong with validate order data with joi",
            errorCode: -1,
            data: ""
        })
    }

    // 2. post order data to the database:
    let date = new Date().toJSON();
    try {
        let newOrder = new Order({
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            detail: req.body.detail,
            totalPrice: req.body.totalPrice,
            createdAt: date,
            updatedAt: date,
            userId: req.body.userId,
            isFinished: false
        })
        newOrder.save()

        return res.status(200).json({
            errorMessage: "Create a New Order Successfully!!!",
            errorCode: 0,
            data: ""
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: "something wrong with post order data to the database",
            errorCode: -1,
            data: ""
        })
    }
    //console.log(req.body);


    res.send("post order")
}

export const getOrderHistory = async (req: express.Request, res: express.Response) => {

    //0. verify access token
    let accountInfo: any;
    if (req.headers.authorization) {
        //1. get access token sent from front end
        let access_token = req.headers.authorization.split(' ')[1]
        try {
            // 2. verify accesstoken
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
            accountInfo = decoded
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

    // 1. find order detail based on userId decoded from jwt token:
    let userId = accountInfo.data.id;
    try {
        let response = await Order.find({ userId: userId })
        return res.status(200).json({
            errorMessage: "Get order history Successfully!!!",
            errorCode: 0,
            data: response
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with finding order detail based on userId decoded from jwt token",
            errorCode: -1,
            data: ""
        })

    }
    //console.log(accountInfo);

    res.send("getOrderHistory getOrderHistory")
}

export const getOrderPagination = async (req: express.Request, res: express.Response) => {

    //0. verify access token
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

    // 1. get total number of order in the DB
    let totalOrder: number;
    try {
        let response = await Order.find().count()
        totalOrder = response;

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with get total number of order in the DB",
            errorCode: -1,
            data: ""
        })

    }

    // 2. Get order from database based on current and pageSize got from front end:
    try {
        let response = await Order.find()
            .skip((Number(req.query.current) - 1) * Number(req.query.pageSize))
            .limit(Number(req.query.pageSize))

        return res.status(200).json({
            errorMessage: "Get Order detail with Pagination successfully!!!",
            errorCode: 0,
            data: {
                totalOrder: totalOrder,
                orderDetail: response
            }
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with Get order from database based on current and pageSize",
            errorCode: -1,
            data: ""
        })

    }
    // console.log(req.query);

    // res.send("getOrder")
}

export const postMarkDelivered = async (req: express.Request, res: express.Response) => {

    //0. verify access token
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

    // 1. change the order status to true in the database:

    try {
        let response = await Order.findByIdAndUpdate(req.query.id, { isFinished: true })

        return res.status(200).json({
            errorMessage: "Mark Order Delivered Successfully!!!",
            errorCode: 0,
            data: ""
        })

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with change the order status to true in the database",
            errorCode: -1,
            data: ""
        })

    }
    // console.log(req.query);

    // res.send("postMarkDelivered")
}