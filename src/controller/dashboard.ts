import express from "express"
import mongoose from "mongoose";
import { Order } from "../db/order"
import { User } from "../db/user"
const jwt = require("jsonwebtoken")


export const getDashboard = async (req: express.Request, res: express.Response) => {

    let totalUser: number;
    let totalOrder: number;
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

    // 1. find number of users in User model:
    try {
        let response = await User.count();
        totalUser = response;

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with finding number of users in User model",
            errorCode: -1,
            data: ""
        })

    }

    // 2. find number of orders in Order model:
    try {
        let response = await Order.count();
        totalOrder = response;

    } catch (error) {
        return res.status(400).json({
            errorMessage: "Something wrong with finding number of orders in Order model",
            errorCode: -1,
            data: ""
        })

    }

    //3. send response back to front end:
    return res.status(200).json({
        errorMessage: "Get Dashboard detail successfully!!!",
        errorCode: 0,
        data: {
            totalOrder, totalUser
        }
    })
    res.send("getDashboard")

}

