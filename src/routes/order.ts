import express from "express"
const apiRouter = express.Router()
import { postOrder } from "./../controller/order"


apiRouter.post('/', postOrder);




export default apiRouter;