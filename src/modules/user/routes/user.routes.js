import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";
import { requirePermission } from "../../../middleware/rbac.middleware.js";

import { PERMISSIONS } from "../../rbac/index.js";

import {
    status,
    list,
    listByCompany,
    show,
    create,
    update,
    destroy
} from "../controllers/user.controller.js";

const router = Router();

router.get("/status", status);

router.get(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.USER_READ),
    list
);

router.get(
    "/company/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.USER_READ),
    listByCompany
);

router.post(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.USER_CREATE),
    create
);

router.get(
    "/:userId",
    requireAuth,
    requirePermission(PERMISSIONS.USER_READ),
    show
);

router.put(
    "/:userId",
    requireAuth,
    requirePermission(PERMISSIONS.USER_UPDATE),
    update
);

router.delete(
    "/:userId",
    requireAuth,
    requirePermission(PERMISSIONS.USER_DELETE),
    destroy
);

export default router;