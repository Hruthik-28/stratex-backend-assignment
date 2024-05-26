import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// routes import
import userRouter from "./routes/user.route.js";
import sellerRouter from "./routes/seller.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller", sellerRouter);

export default app;
