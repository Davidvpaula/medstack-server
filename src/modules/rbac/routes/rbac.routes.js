import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";

import {
    status,
    permissions
} from "../controllers/rbac.controller.js";

const router = Router();

router.get("/status", status);

router.get("/permissions", requireAuth, permissions);

export default router;