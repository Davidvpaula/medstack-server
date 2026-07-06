import { Router } from "express";

import { requireAuth } from "../../../middleware/auth.middleware.js";
import { requirePermission } from "../../../middleware/rbac.middleware.js";

import { PERMISSIONS } from "../../rbac/index.js";

import {
    status,
    list,
    listByCompany,
    listByConversation,
    listByContact,
    show,
    create,
    update,
    destroy,
    sent,
    delivered,
    read,
    failed
} from "../controllers/message.controller.js";

const router = Router();

router.get("/status", status);

router.get(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    list
);

router.get(
    "/company/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    listByCompany
);

router.get(
    "/conversation/:conversationId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    listByConversation
);

router.get(
    "/contact/:contactId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    listByContact
);

router.post(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    create
);

router.get(
    "/:messageId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_READ),
    show
);

router.put(
    "/:messageId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    update
);

router.patch(
    "/:messageId/sent",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    sent
);

router.patch(
    "/:messageId/delivered",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    delivered
);

router.patch(
    "/:messageId/read",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    read
);

router.patch(
    "/:messageId/failed",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_REPLY),
    failed
);

router.delete(
    "/:messageId",
    requireAuth,
    requirePermission(PERMISSIONS.CONVERSATION_DELETE),
    destroy
);

export default router;