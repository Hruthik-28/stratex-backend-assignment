import { Router } from "express";
import {
    addBooks,
    deleteAllBooks,
    deleteBook,
    editBook,
    getAllBooks,
    loginSeller,
    logoutSeller,
    refreshAccessToken,
    registerSeller,
} from "../controllers/seller.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlearwe.js";

const router = Router();

router.route("/register").post(registerSeller);
router.route("/login").post(loginSeller);

router.route("/book/:bookId").delete(verifyJWT, deleteBook);
router.route("/logout").post(verifyJWT, logoutSeller);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router
    .route("/books")
    .post(verifyJWT, upload.single("file"), addBooks)
    .get(verifyJWT, getAllBooks)
    .patch(verifyJWT, editBook)
    .delete(verifyJWT, deleteAllBooks);

export default router;
