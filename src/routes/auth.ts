import express from "express"
const apiRouter = express.Router()
import { postLogin, getAccount } from "./../controller/auth"


apiRouter.post('/login', postLogin);
apiRouter.get('/account', getAccount);



export default apiRouter;