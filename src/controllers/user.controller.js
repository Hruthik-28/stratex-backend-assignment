import prisma from "../db/db.config.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../helpers/token.js";

export const generateAccessAndRefreshToken = async (schema, id) => {
    if (schema !== "user" && schema !== "seller") {
        throw new ApiError(404, "Invalid Schema or model");
    }

    const model = schema === "user" ? prisma.user : prisma.seller;

    try {
        const user = await model.findUnique({ where: { id } });

        const accessToken = generateAccessToken({
            id: user.id,
            name: user.name,
            email: user.email,
            type: schema === "user" ? "user" : "seller",
        });
        const refreshToken = generateRefreshToken({ userId: user.id });

        await model.update({
            where: { id },
            data: { accessToken, refreshToken },
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(
            500,
            error.message || "Something went wrong while generating tokens."
        );
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const emailExists = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (emailExists) {
        throw new ApiError(400, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    if (!createdUser) {
        throw new ApiError(500, "Seller registration failed. Please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Seller registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required");
    }

    const foundUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!foundUser) {
        throw new ApiError(400, "Email is not registered");
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password);

    if (!passwordMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        "user",
        foundUser.id
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "User loggedIn Successfully"
            )
        );
});

export const getAllBooks = asyncHandler(async (req, res) => {
    const books = await prisma.book.findMany();

    if (!books || books.length === 0) {
        throw new ApiError(404, "No Books Found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, books, "All Books Fetched Successfully"));
});

export const getABook = asyncHandler(async (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const book = await prisma.book.findFirst({ where: { id: bookId } });

    if (!bookId || isNaN(bookId)) {
        throw new ApiError(400, "Invalid Book Id");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, book, "All Books Fetched Successfully"));
});
