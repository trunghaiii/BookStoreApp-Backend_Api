import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination
} from "./../controller/book"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.get('/', getBookPagination);




export default apiRouter;