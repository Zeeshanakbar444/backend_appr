
import { ApiError } from "../utils/ApiError.js"
import { asynHandler } from "../utils/asynHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
export const verifyJWT = asynHandler(async (req,res,next)=>{
try {
    const token  = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"unauthorized request")
    }
    
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user) {
        // todo disscuss about frontend  : in next vedio
        throw new ApiError(401,"invalid access token")
    }
    req.user = user;
    next();
} catch (error) {
    throw new ApiError(401,error?.message || "invalid user")
}
})