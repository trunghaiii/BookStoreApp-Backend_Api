import express from "express"
const apiRouter = express.Router()
import {
    getBookPagination, postCreateBook,
    getUploadImage, postUpdateBook,
    deleteBook, getBookDetail,
    getHomeBookPagination,
    postComment
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
apiRouter.post('/comment', postComment);









export default apiRouter;