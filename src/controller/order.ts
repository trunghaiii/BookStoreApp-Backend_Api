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