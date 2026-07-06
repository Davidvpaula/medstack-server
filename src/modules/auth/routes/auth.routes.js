import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";

import {
    status,
    me,
    registerController,
    loginController,
    refreshController,
    logoutController
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/status", status);

router.get("/me", requireAuth, me);

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", refreshController);

router.post("/logout", logoutController);

export default router;