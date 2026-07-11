import { Router } from "express";

import {
    response
} from "../core/response.js";

import {
    AppError
} from "../core/errors/AppError.js";

import healthRoutes from "./health.routes.js";
import databaseRoutes from "./database.routes.js";
import systemRoutes from "./system.routes.js";

import whatsappRoutes from "../modules/whatsapp/index.js";
import companyRoutes from "../modules/company/index.js";
import userRoutes from "../modules/user/index.js";
import authRoutes from "../modules/auth/index.js";
import rbacRoutes from "../modules/rbac/index.js";
import contactRoutes from "../modules/contact/index.js";
import conversationRoutes from "../modules/conversation/index.js";
import messageRoutes from "../modules/message/index.js";
import inboxRoutes from "../modules/inbox/index.js";
import aiMonitorRoutes from "../modules/ai-monitor/index.js";

const router = Router();

router.get("/", (req, res) => {
    return response.success(
        res,
        "Servidor online",
        {
            app: "MedStack",
            version: "1.0.0"
        }
    );
});

router.get("/health", (req, res) => {
    return response.success(
        res,
        "Servidor funcionando"
    );
});

router.get("/teste-erro", (req, res) => {
    throw new AppError(
        "Erro de teste funcionando.",
        400
    );
});

router.use(
    "/health",
    healthRoutes
);

router.use(
    "/database",
    databaseRoutes
);

router.use(
    "/system",
    systemRoutes
);

router.use(
    "/whatsapp",
    whatsappRoutes
);

router.use(
    "/company",
    companyRoutes
);

router.use(
    "/user",
    userRoutes
);

router.use(
    "/auth",
    authRoutes
);

router.use(
    "/rbac",
    rbacRoutes
);

router.use(
    "/contact",
    contactRoutes
);

router.use(
    "/conversation",
    conversationRoutes
);

router.use(
    "/message",
    messageRoutes
);

router.use(
    "/inbox",
    inboxRoutes
);

router.use(
    "/ai-monitor",
    aiMonitorRoutes
);

export default router;