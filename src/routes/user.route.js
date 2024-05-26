import { Router } from "express";
import {
    getABook,
    getAllBooks,
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/getAllBooks").get(verifyJWT, getAllBooks);
router.route("/getABook/:bookId").get(verifyJWT, getABook);

export default router;
