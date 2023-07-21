import express from "express"
const apiRouter = express.Router()
import { postOrder, getOrderHistory, getOrderPagination } from "./../controller/order"


apiRouter.post('/', postOrder);
apiRouter.get('/history', getOrderHistory);
apiRouter.get('/', getOrderPagination);




export default apiRouter;