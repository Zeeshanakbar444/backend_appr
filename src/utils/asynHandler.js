/*
this is first way using promises .
*/

const asynHandler = (reqHandler) => {
   return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
    };
};


// this is another way using try catch

// const asynHandler = (fun) => async (req, res, next) => {
//   try {
//     await fun(req, res, next);
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       Message: err.Message,
//     });
//   }
// };

/*
const asynHandler  = (fun)=>{}
    const asynHandler  = (fun)=>{
        fun(){
        
    }
}
const asynHandler  = (fun)=>{()=>{}}
    */

export { asynHandler };
