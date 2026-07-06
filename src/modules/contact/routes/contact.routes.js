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
    destroy,
    search,
    findByPhone,
    favorites,
    archived,
    blocked,
    favorite,
    unfavorite,
    archive,
    unarchive,
    block,
    unblock,
    activity
} from "../controllers/contact.controller.js";

const router = Router();

router.get("/status", status);

router.get(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    list
);

router.get(
    "/company/:companyId",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    listByCompany
);

router.get(
    "/company/:companyId/search",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    search
);

router.get(
    "/company/:companyId/phone",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    findByPhone
);

router.get(
    "/company/:companyId/favorites",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    favorites
);

router.get(
    "/company/:companyId/archived",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    archived
);

router.get(
    "/company/:companyId/blocked",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    blocked
);

router.post(
    "/",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_CREATE),
    create
);

router.get(
    "/:contactId",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_READ),
    show
);

router.put(
    "/:contactId",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    update
);

router.patch(
    "/:contactId/favorite",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    favorite
);

router.patch(
    "/:contactId/unfavorite",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    unfavorite
);

router.patch(
    "/:contactId/archive",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    archive
);

router.patch(
    "/:contactId/unarchive",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    unarchive
);

router.patch(
    "/:contactId/block",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    block
);

router.patch(
    "/:contactId/unblock",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    unblock
);

router.patch(
    "/:contactId/activity",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_UPDATE),
    activity
);

router.delete(
    "/:contactId",
    requireAuth,
    requirePermission(PERMISSIONS.CONTACT_DELETE),
    destroy
);

export default router;