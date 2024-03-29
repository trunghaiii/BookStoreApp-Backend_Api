import express from "express"
const apiRouter = express.Router()
import {
    postRegisterUser, getUserPagination,
    postCreateUser, postUpdateUser, deleteUser,
    putUpdateUserInfo, putUpdatePassword
} from "./../controller/user"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.post('/register', postRegisterUser);
apiRouter.get('/', getUserPagination);
apiRouter.post('/', postCreateUser);
apiRouter.put('/', postUpdateUser);
apiRouter.delete('/', deleteUser);
apiRouter.put('/info', putUpdateUserInfo);
apiRouter.put('/password', putUpdatePassword);





export default apiRouter;