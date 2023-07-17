import express from "express"
const apiRouter = express.Router()
import { postOrder, getOrderHistory } from "./../controller/order"


apiRouter.post('/', postOrder);
apiRouter.get('/history', getOrderHistory);




export default apiRouter;