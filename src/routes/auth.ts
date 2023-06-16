import express from "express"
const apiRouter = express.Router()
import { postLogin, getAccount, postLogOut, getRefreshToken } from "./../controller/auth"


apiRouter.post('/login', postLogin);
apiRouter.get('/account', getAccount);
apiRouter.post('/logout', postLogOut);
apiRouter.get('/refresh', getRefreshToken);



export default apiRouter;