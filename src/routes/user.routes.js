import { Router } from "express";
const router = Router();

import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAcccessToken,
} from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/logout").post(verifyJwt, logoutUser);
export default router;
