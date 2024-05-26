import JWT from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import prisma from "../db/db.config.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = JWT.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        let user;
        if (decodedToken?.type === "user") {
            user = await prisma.user.findUnique({
                where: { id: decodedToken?.id },
            });
        }
        user = await prisma.seller.findUnique({
            where: { id: decodedToken?.id },
        });

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
