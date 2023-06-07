import express from "express"
const apiRouter = express.Router()
import { postRegisterUser } from "./../controller/user"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.post('/register', postRegisterUser);


export default apiRouter;