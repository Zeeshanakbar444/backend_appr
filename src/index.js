import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT||8000 , ()=>{
console.log(`server is running on ${process.env.PORT}`);

    })
  })

  .catch((err) => {
    console.log("mongo db connection is failed", err);
  });

/*
import express from "express";
let app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR YE HA", error);
    });
    app.listen(process.env.PORT, () => {
        console.log(`app is running on port number ${process.env.PORT}`)
    });
} catch (error) {
    console.log("ERROR ye ha", error);
    throw error;
}
})();
*/
