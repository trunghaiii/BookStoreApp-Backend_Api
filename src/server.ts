require('dotenv').config()
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
const cors = require('cors')

import mongooseConnection from "./config/mongoose"
import userRoute from "./routes/user"
import authRoute from "./routes/auth"

const app: Application = express();

const PORT = process.env.PORT || 6969;

//config to get req.body from client input
app.use(bodyParser.urlencoded({ extended: true }));
// config to fix being blocked by cors policy when call api from frontend
app.use(cors());


app.use('/api/v1/user', userRoute);
app.use('/api/v1/auth', authRoute);


app.listen(PORT, async () => {
    await mongooseConnection()
    console.log('SERVER IS UP ON PORT:', PORT);
});