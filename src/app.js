import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json()); // to parse json
app.use(express.urlencoded({ extended: true })); //to encode url data
app.use(express.static("public")); //to access public files

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);

app.use(errorHandler);
export { app };
