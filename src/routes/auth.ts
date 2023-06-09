import express from "express"
const apiRouter = express.Router()
import { postLogin } from "./../controller/auth"


apiRouter.post('/login', postLogin);


export default apiRouter;