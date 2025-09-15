import { asynHandler } from "../utils/asynHandler.js";
const registerUser = asynHandler(async (req,res)=>{
   return res.status(200).json({
    message:"this is ok api correct"
   })
})
export {registerUser}