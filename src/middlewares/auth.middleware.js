import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/aynchandler";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  const incomingToken =
    req.cookies("accessToken") ||
    req.body.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (!incomingToken) {
    throw new ApiError(404, "access token not found");
  }
  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken ",
    );
    req.user = user;
    next();
    if (!user) {
      throw new ApiError(404, "user not found");
    }
  } catch (error) {
    throw new ApiError(404, "user not found based on token");
  }
});
