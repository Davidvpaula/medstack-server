import { Router } from "express";

import * as controller from "../controllers/conversation.controller.js";

const router = Router();

router.get("/status", controller.status);

router.get("/", controller.list);

router.get("/company/:companyId", controller.listByCompany);

router.get("/contact/:contactId", controller.listByContact);

router.get("/:conversationId", controller.show);

router.post("/", controller.create);

router.put("/:conversationId", controller.update);

router.delete("/:conversationId", controller.destroy);

router.patch("/:conversationId/assign", controller.assign);

router.patch("/:conversationId/close", controller.close);

router.patch("/:conversationId/reopen", controller.reopen);

router.patch("/:conversationId/archive", controller.archive);

router.patch("/:conversationId/inbound", controller.inbound);

router.patch("/:conversationId/outbound", controller.outbound);

router.patch("/:conversationId/typing", controller.typing);

router.patch("/:conversationId/read", controller.read);

router.patch("/:conversationId/enable-ai", controller.enableAI);

router.patch("/:conversationId/disable-ai", controller.disableAI);

router.patch("/:conversationId/enable-flow", controller.enableFlow);

router.patch("/:conversationId/disable-flow", controller.disableFlow);

export default router;