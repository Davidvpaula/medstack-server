import { Router } from "express";
import { response } from "../core/response.js";
import { AppError } from "../core/errors/AppError.js";

import whatsappRoutes from "../modules/whatsapp/index.js";
import companyRoutes from "../modules/company/index.js";
import userRoutes from "../modules/user/index.js";

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
    throw new AppError("Erro de teste funcionando.", 400);
});

router.use("/whatsapp", whatsappRoutes);

router.use("/company", companyRoutes);

router.use("/user", userRoutes);

export default router;
