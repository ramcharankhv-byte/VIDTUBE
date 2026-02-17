import { asyncHandler } from "../utils/aynchandler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api-response.js";

const generateAccessAndRefreshTokens = asyncHandler(async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log("access fn 👉", typeof user.generateAccessToken);
    console.log("refresh fn 👉", typeof user.generateRefreshToken);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(509, "Error while generating tokens", error);
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;

  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  console.log(req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  let avatar;
  let coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath, username, "avatar");
  } catch (error) {
    console.log("Cloudinary error:", error);
    throw new ApiError(500, error.message);
  }
  try {
    coverImage = coverLocalPath
      ? await uploadOnCloudinary(coverLocalPath, username, "coverImage")
      : "";
  } catch (error) {
    throw new ApiError(500, "error uploading coverImage on cloudinary");
  }

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Avatar upload failed");
  }
  try {
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      avatar: { url: avatar.url, public_id: avatar.public_id },
      coverImage: { url: coverImage.url, public_id: coverImage.public_id },
    });

    const createdUser = await User.findById(user?.id).select(
      "-password, -refreshToken",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User created"));
  } catch (error) {
    console.log("Error Creating User");
    deleteFromCloudinary(avatar.public_id);
    deleteFromCloudinary(coverImage?.public_id);
    cosnole.log("Images Deleted");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    if (!email) {
      throw new ApiError(404, "user does not exists");
    }
  }

  const isPassCorrect = await user.isPassCorrect(password);
  if (!isPassCorrect) {
    if (!email) {
      throw new ApiError(401, "invalid login credentials");
    }
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user?._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken ",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  if (!loggedInUser) {
    throw new ApiError(509, "Something went wrong while registering", []);
  }

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Loggedin Successfully",
      ),
    );
});

const refreshAcccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "No refresh token found please relogin");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(404, "No Token Found in DATABASE");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.accessToken = accessToken;
    user.refreshToken = newRefreshToken;

    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            refrehToken: user.refreshToken,
            accessToken: user.accessToken,
          },
          "Tokens Refreshed",
        ),
      );
  } catch (err) {
    console.log("error generating token : ", err);
    throw new ApiError(401, "error generating token");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
        accessToken: undefined,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out"));
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "user not found");
    }
    const isPasswordValid = await user.isPassCorrect(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Password incorrect u biotch");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "password changed"));
  } catch (error) {
    console.log("error in changing password: ", error);
    throw new ApiError(401, "Something went wrong");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched succesfully"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { email, username } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "any field required to update");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (email) {
    user.email = email;
  }

  if (username) {
    user.username = username;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      email: user.email,
      username: user.username,
    }),
  );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  var avatar;
  try {
    avatar = await uploadOnCloudinary(avatarPath, user.username, "avatar");
    if (!avatar) {
      throw new ApiError(400, "error uploading avatar in cloud");
    }
  } catch (error) {
    console.log("Cloudinary error:", error);
    throw new ApiError(400, "error while uploading in cloudinary");
  }

  const oldPublicId = user.avatar?.public_id;

  user.avatar = { url: avatar.url, public_id: avatar.public_id };

  await user.save({ validateBeforeSave: false });

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  return res.status(200).json(new ApiResponse(200, "user avatar updated"));
});

const updateCover = asyncHandler(async (req, res) => {
  const coverImagePath = req.files?.avatar?.[0]?.path;
  if (!coverImagePath) {
    throw new ApiError(400, "Cover file is required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  var coverImage;
  try {
    coverImage = await uploadOnCloudinary(avatarPath, user.username, "avatar");
    if (!coverImage) {
      throw new ApiError(400, "error uploading avatar in cloud");
    }
  } catch (error) {
    console.log("Cloudinary error:", error);
    throw new ApiError(400, "error while uploading in cloudinary");
  }

  const oldPublicId = user.cloudImage?.public_id;

  user.cloudImage = { url: avatar.url, public_id: avatar.public_id };

  await user.save({ validateBeforeSave: false });

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  return res.status(200).json(new ApiResponse(200, "user avatar updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedCount: {
          $size: "$subscribedTo",
        },
        isSubsribedTO: {
          $cond: {
            $if: { $in: [req.user?._id, "$subscribers.subsriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        subscriberCount: 1,
        channelsSubscribedCount: 1,
        isSubsribedTO: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "channel profile fetched"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                    fullname: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
});

export {
  registerUser,
  loginUser,
  refreshAcccessToken,
  logoutUser,
  changePassword,
  getCurrentUser,
  updateDetails,
  updateAvatar,
  updateCover,
  getUserChannelProfile,
  getWatchHistory,
};
