import express from "express"
import mongoose from "mongoose";
import { User } from "../db/user"

export const postAddUser = async (req: express.Request, res: express.Response) => {

    const { name, age, location } = req.body

    try {
        const user = new User({
            name: name,
            age: +age,
            location: location
        });
        await user.save();
        // console.log(typeof (theAge));


        return res.status(200).json({
            EM: "Adding a new User successfully",
            EC: 0,
            DT: ""
        })
    } catch (error) {
        console.log(error);

        return res.status(400).json({
            EM: "something went wrong with adding a new user",
            EC: -1,
            DT: ""
        })
    }


    // res.send("Hello World !!")
};