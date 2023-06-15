import express from "express"
const apiRouter = express.Router()
import { postLogin, getAccount, postLogOut } from "./../controller/auth"


apiRouter.post('/login', postLogin);
apiRouter.get('/account', getAccount);
apiRouter.post('/logout', postLogOut);



export default apiRouter;