import express from "express"
let app = express()
let port = 3000


app.get("/" ,  (req,res)=> {
    res.send("this is the home page")
})
app.listen(port , ()=>{
    console.log(`app is running on port number ${port}`)
})