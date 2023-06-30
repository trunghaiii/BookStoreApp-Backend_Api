import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination, postCreateBook, getUploadImage
} from "./../controller/book"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.get('/', getBookPagination);
apiRouter.post('/upload-image', getUploadImage);
apiRouter.post('/', postCreateBook);





export default apiRouter;