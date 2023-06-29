import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination, postCreateBook
} from "./../controller/book"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.get('/', getBookPagination);
apiRouter.post('/', postCreateBook);





export default apiRouter;