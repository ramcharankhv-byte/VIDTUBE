import mongoose from "mongoose";
const databaseName = "vidtube";
console.log(process.env.MONGO_URL);
console.log(process.env.PORTc);
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}/${databaseName}`);
    console.log(" '✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export default connectDB;
