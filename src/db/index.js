import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(" mongodb connected !! db host yaha ha shi " , connectionInstance.connection.host);
  } catch (error) {
    console.log("eeror ye ha", error);
  }
};
export default connectDB;