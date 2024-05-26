import { Router } from "express";
import {
    addBooks,
    deleteAllBooks,
    deleteBook,
    editBook,
    getAllBooks,
    loginSeller,
    registerSeller,
} from "../controllers/seller.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlearwe.js";

const router = Router();

router.route("/register").post(registerSeller);
router.route("/login").post(loginSeller);
router
    .route("/books")
    .post(verifyJWT, upload.single("file"), addBooks)
    .get(verifyJWT, getAllBooks)
    .patch(verifyJWT, editBook)
    .delete(verifyJWT, deleteAllBooks);
router.route("/book/:bookId").delete(verifyJWT, deleteBook);

export default router;
