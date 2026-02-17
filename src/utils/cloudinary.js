import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./api-error.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

console.log(
  "name:",
  process.env.CLOUDINARY_NAME,
  "key:",
  process.env.CLOUDINARY_API_KEY,
  "secret:",
  process.env.CLOUDINARY_API_SECRET,
);
const uploadOnCloudinary = async (localFilePath, username, name) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      public_id: `users/${username}-${name}`,
    });
    console.log("file uploaded on cloudinary. File src: ", response.url);
    //once the file is uploaded we will delete it from our servers
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new ApiError(500, error.message);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const deleteFile = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from cloud");
  } catch (error) {
    console.log("Error deleting file: ", publicId);
  }
};
export { uploadOnCloudinary, deleteFromCloudinary };
