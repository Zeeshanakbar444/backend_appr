import { asynHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// this method use for both access and refresh toekn generate easily
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asynHandler(async (req, res) => {
  //get user detail from frontend
  // validation (if user not send empty field)
  // check if user already exists :email,username
  // check for images
  // check for avatar (compulsary)
  // upload on cloudinary, avatar
  //create user object - create entry in database
  // remove password and refresh token field from response
  // check for user creation
  //return response

  // 1
  const { fullName, email, username, password } = req.body;
  console.log("email", email);
  //2
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //3
  let existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user already exists");
  }

  //4
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // let coverImageLocation = req.files?.coverImage[0]?.path;
  let coverImageLocation;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage > 0
  ) {
    coverImageLocation = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocation);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "someting when wrong in register user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register successfully"));
});

/// login controller
const loginUser = asynHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("userId", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asynHandler(async (req, res) => {
  // Ensure req.user exists and has _id, otherwise handle error
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "user logout"));
});

const refreshAccessToken = asynHandler(async (req, res) => {
  const inComingRefreshTOken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (inComingRefreshTOken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      inComingRefreshTOken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if(inComingRefreshTOken!==user?.refreshToken){
      
      throw new ApiError(401, "Refresh token is expired");
    }
  const options = {
    httpOnly:true,
    secure:true
  }
  const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  return res.status(200).
  cookie("accessToken",accessToken,options)
  .cookie("refreshToken" , newRefreshToken,options
    .json(new ApiResponse(200,{accessToken,newRefreshToken} , "access token successfully refresh"))
  )
  } catch (error) {
    throw new ApiError(401,error.message)
  }
});
export { registerUser, loginUser, logoutUser,refreshAccessToken };
