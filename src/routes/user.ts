import express from "express"
const apiRouter = express.Router()
import { postRegisterUser, getUserPagination, postCreateUser } from "./../controller/user"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.post('/register', postRegisterUser);
apiRouter.get('/', getUserPagination);
apiRouter.post('/', postCreateUser);



export default apiRouter;