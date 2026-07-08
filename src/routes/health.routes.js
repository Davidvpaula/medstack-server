import { Router } from "express";

import {
    databaseHealth
} from "../controllers/health.controller.js";

const router = Router();

router.get("/database", databaseHealth);

export default router;