import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";
import { requirePermission } from "../../../middleware/rbac.middleware.js";

import { PERMISSIONS } from "../../rbac/index.js";

import {
    status,
    listByCompany,
    open,
    unread,
    closed,
    archived,
    assigned,
    stats
} from "../controllers/inbox.controller.js";

const router = Router();

router.get("/status", status);

router.get(
    "/company/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    listByCompany
);

router.get(
    "/company/:companyId/open",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    open
);

router.get(
    "/company/:companyId/unread",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    unread
);

router.get(
    "/company/:companyId/closed",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    closed
);

router.get(
    "/company/:companyId/archived",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    archived
);

router.get(
    "/company/:companyId/assigned/:userId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    assigned
);

router.get(
    "/company/:companyId/stats",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    stats
);

export default router;