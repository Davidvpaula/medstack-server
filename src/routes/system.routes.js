import {
    Router
} from "express";

import {
    diagnostics
} from "../controllers/system.controller.js";

const router = Router();

router.get(
    "/diagnostics",
    diagnostics
);

export default router;