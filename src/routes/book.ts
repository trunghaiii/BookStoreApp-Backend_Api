import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination, postCreateBook,
    getUploadImage, postUpdateBook,
    deleteBook, getBookDetail,
    getHomeBookPagination
} from "./../controller/book"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.get('/', getBookPagination);
apiRouter.get('/home', getHomeBookPagination);
apiRouter.post('/upload-image', getUploadImage);
apiRouter.post('/', postCreateBook);
apiRouter.put('/', postUpdateBook);
apiRouter.delete('/', deleteBook);
apiRouter.get('/detail', getBookDetail);








export default apiRouter;