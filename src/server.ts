require('dotenv').config()
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');
const cors = require('cors')
const { storage } = require("./cloudinary/index")

// config to get req.body and req.file via form data
const multer = require('multer')
const upload = multer({ storage });

import mongooseConnection from "./config/mongoose"
import userRoute from "./routes/user"
import bookRoute from "./routes/book"
import authRoute from "./routes/auth"
import orderRoute from "./routes/order"
import dashboardRoute from "./routes/dashboard"

const app: Application = express();

const PORT = process.env.PORT || 6969;


//config to get req.body from client input
app.use(bodyParser.urlencoded({ extended: true }));
//config to get cookies value
app.use(cookieParser());


// config middleware to access raw data
app.use(bodyParser.json({ type: 'application/json' }));

// config to fix being blocked by cors policy when call api from frontend
app.use(cors({
    origin: '*', // Specify the allowed origin
    credentials: true, // Allow credentials 
}));

// fix bug blocked by cors policy
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});


app.use('/api/v1/user', upload.single('userImage'), userRoute);
app.use('/api/v1/book', upload.single("bookImageFile"), bookRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/dashboard', dashboardRoute);


app.listen(PORT, async () => {
    await mongooseConnection()
    console.log('SERVER IS UP ON PORT:', PORT);
});