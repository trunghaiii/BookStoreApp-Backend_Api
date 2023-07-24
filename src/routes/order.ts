import express from "express"
const apiRouter = express.Router()
import {
    postOrder, getOrderHistory,
    getOrderPagination, postMarkDeliveredPending
} from "./../controller/order"


apiRouter.post('/', postOrder);
apiRouter.get('/history', getOrderHistory);
apiRouter.get('/', getOrderPagination);
apiRouter.post('/delivered', postMarkDeliveredPending);




export default apiRouter;