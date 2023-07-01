import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination, postCreateBook,
    getUploadImage, postUpdateBook,
    deleteBook
} from "./../controller/book"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.get('/', getBookPagination);
apiRouter.post('/upload-image', getUploadImage);
apiRouter.post('/', postCreateBook);
apiRouter.put('/', postUpdateBook);
apiRouter.delete('/', deleteBook);







export default apiRouter;