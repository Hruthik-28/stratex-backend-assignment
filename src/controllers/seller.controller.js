import prisma from "../db/db.config.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import { generateAccessAndRefreshToken } from "./user.controller.js";
import parseCSVFile from "../utils/csvParser.js";
import { options } from "../../constants.js";

export const registerSeller = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const emailExists = await prisma.seller.findUnique({
        where: {
            email,
        },
    });

    if (emailExists) {
        throw new ApiError(400, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdSeller = await prisma.seller.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    if (!createdSeller) {
        throw new ApiError(500, "Seller registration failed. Please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "User registered successfully"));
});

export const loginSeller = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required");
    }

    const foundSeller = await prisma.seller.findUnique({
        where: {
            email,
        },
    });

    if (!foundSeller) {
        throw new ApiError(400, "Email is not registered as Seller");
    }

    const passwordMatch = await bcrypt.compare(password, foundSeller.password);

    if (!passwordMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        "seller",
        foundSeller.id
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Seller loggedIn Successfully"
            )
        );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;
    const sellerId = req.user.id;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    const seller = await prisma.seller.findFirst({
        where: { refreshToken: incomingRefreshToken },
    });

    if (!seller) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        "seller",
        sellerId
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

export const logoutSeller = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;

    await prisma.seller.updateMany({
        where: { id: sellerId },
        data: { accessToken: null, refreshToken: null },
    });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Seller logout successfull !!!."));
});

export const addBooks = asyncHandler(async (req, res) => {
    const csvFilePath = req.file.path;
    const sellerId = req.user.id;

    if (!csvFilePath) {
        throw new ApiError(400, "CSV file Path is required");
    }

    const booksData = await parseCSVFile(csvFilePath);

    if (!booksData) {
        throw new ApiError(500, "Failed to parse the csv file");
    }

    if (booksData.length < 1) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "File is empty, no books added"));
    }

    const books = booksData.map((book) => ({
        title: book[0],
        author: book[1],
        publishedDate: new Date(book[2]),
        price: parseFloat(book[3]),
        sellerId: sellerId,
    }));

    const createdBooks = await prisma.book.createMany({ data: books });

    if (!createdBooks) {
        throw new ApiError(500, "Failed to add books record.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                `${booksData.length} Books added successfully`
            )
        );
});

export const getAllBooks = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const {
        page = 1,
        limit = 10,
        sortBy = "creadtedAt",
        sortType = "asc",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOrder = sortType.toLowerCase() === "desc" ? "desc" : "asc";

    const validSortFields = [
        "title",
        "author",
        "createdAt",
        "updatedAt",
        "publishedDate",
        "price",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Get total number of books of particular seller by aggregating of
    const totalBooks = await prisma.book.aggregate({
        _count: {
            id: true,
        },
        where: {
            sellerId,
        },
    });

    const totalCount = totalBooks._count.id;

    const books = await prisma.book.findMany({
        where: {
            sellerId,
        },
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

export const editBook = asyncHandler(async (req, res) => {
    const { bookId, title, price, author } = req.body;
    const sellerId = req.user.id;

    if (!bookId || !title || !price || !author) {
        throw new ApiError(
            400,
            "BookId, title, price, and author are required"
        );
    }

    const book = await prisma.book.findFirst({ where: { id: bookId } });

    if (!book) {
        throw new ApiError(404, "No book found with given bookId");
    }
    if (sellerId !== book.sellerId) {
        throw new ApiError(
            400,
            "Unauthorized request. Only Book owner i.e thier seller can edit books."
        );
    }

    const editedBook = await prisma.book.update({
        where: { id: bookId, sellerId },
        data: {
            title,
            price,
            author,
        },
    });

    if (!editedBook) {
        throw new ApiError(500, "Failed to edit book");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                id: editedBook.id,
                title: editedBook.title,
                price: editedBook.price,
                author: editedBook.author,
                sellerId,
            },
            "Book edited Successfully"
        )
    );
});

export const deleteBook = asyncHandler(async (req, res) => {
    const bookId = parseInt(req.params?.bookId);
    const sellerId = req.user.id;

    if (!bookId) {
        throw new ApiError(400, "BookId is required");
    }
    const book = await prisma.book.findFirst({
        where: { id: bookId },
    });

    if (!book) {
        throw new ApiError(404, "No book found with given bookId");
    }
    if (sellerId !== book.sellerId) {
        throw new ApiError(
            400,
            "Unauthorized request. Only Book owner i.e thier seller can Delete books."
        );
    }

    await prisma.book.delete({ where: { id: bookId, sellerId } });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Book Deleted Successfully"));
});

export const deleteAllBooks = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;

    await prisma.book.deleteMany({ where: { sellerId } });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "All Books Deleted Successfully"));
});
