import prisma from "../db/db.config.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../helpers/token.js";
import { options } from "../../constants.js";

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
        throw new ApiError(500, "User registration failed. Please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "User registered successfully"));
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

export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.updateMany({
        where: { id: userId },
        data: { accessToken: null, refreshToken: null },
    });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout successfull !!!."));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;
    const userId = req.user.id;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    const user = await prisma.user.findFirst({
        where: { refreshToken: incomingRefreshToken },
    });

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        "user",
        userId
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                "Access token refreshed"
            )
        );
});

export const getAllBooks = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "creadtedAt",
        sortType = "asc",
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOrder = sortType.toLowerCase() === "desc" ? "desc" : "asc";
    const validSortFields = [
        "createdAt",
        "title",
        "author",
        "updatedAt",
        "publishedDate",
        "price",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Get total number of books by aggregating
    const totalBooks = await prisma.book.aggregate({
        _count: {
            id: true,
        },
    });

    const totalCount = totalBooks._count.id;

    const books = await prisma.book.findMany({
        skip: skip,
        take: limitNumber,
        orderBy: {
            [sortField]: sortOrder,
        },
    });

    if (!books || books.length === 0) {
        throw new ApiError(404, "No Books Found");
    }

    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;

    const pagination = {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: hasNextPage,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { books, pagination },
                "All Books Fetched Successfully"
            )
        );
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
