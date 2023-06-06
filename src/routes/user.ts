import express from "express"
const apiRouter = express.Router()
import { postAddUser } from "./../controller/user"

// export default (userRoute: express.Router) => {
//     userRoute.get('/user', getUser);
// };

apiRouter.post('/user', postAddUser);


export default apiRouter;