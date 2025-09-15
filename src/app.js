import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
let app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,

}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routers

import userRouter from "./routes/user.routes.js"
//router decleration
app.use("/api/v1/users",userRouter)
// http://localhost/api/v1/users/register

export {app}