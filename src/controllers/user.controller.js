import { asynHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
    throw new ApiError(400, "all field required");
  }

  //3
  let existedUser = User.findOne({
    $or: [[{ username }, { email }]],
  });
  if (existedUser) {
    throw new ApiError(409, "user already exists");
  }

  //4
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocation = req.files?.coverImage[0]?.path;
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
export { registerUser };
