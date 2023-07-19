import express from "express"
const apiRouter = express.Router()
import { getDashboard } from "./../controller/dashboard"


apiRouter.get('/', getDashboard);




export default apiRouter;