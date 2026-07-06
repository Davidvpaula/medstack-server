import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";
import { requirePermission } from "../../../middleware/rbac.middleware.js";

import { PERMISSIONS } from "../../rbac/index.js";

import {
    status,
    list,
    show,
    runtime,
    create,
    update,
    updateRuntime,
    updateHealth,
    updateStatistics,
    destroy
} from "../controllers/company.controller.js";

const router = Router();

router.get("/status", status);

router.get(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_READ),
    list
);

router.post(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_CREATE),
    create
);

router.get(
    "/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_READ),
    show
);

router.get(
    "/:companyId/runtime",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_RUNTIME),
    runtime
);

router.put(
    "/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_UPDATE),
    update
);

router.patch(
    "/:companyId/runtime",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_RUNTIME),
    updateRuntime
);

router.patch(
    "/:companyId/health",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_HEALTH),
    updateHealth
);

router.patch(
    "/:companyId/statistics",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_STATISTICS),
    updateStatistics
);

router.delete(
    "/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.COMPANY_DELETE),
    destroy
);

export default router;