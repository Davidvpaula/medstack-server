import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/core/logger.js";

import {
    autoStartWhatsappRuntimes
} from "./src/modules/whatsapp/services/whatsapp-autostart.service.js";

import {
    startWhatsappHealthMonitor
} from "./src/modules/whatsapp/services/whatsapp-health-monitor.service.js";

import {
    startWhatsappMessageWorker
} from "./src/modules/whatsapp/workers/whatsapp-message.worker.js";

const server = app.listen(env.PORT, async () => {
    logger.success("MedStack Server iniciado");
    logger.info(`Local: http://localhost:${env.PORT}`);

    // Inicia automaticamente todas as instâncias vinculadas
    await autoStartWhatsappRuntimes();

    // Monitora a saúde das conexões
    startWhatsappHealthMonitor();

    // Inicia o Worker responsável pela fila de envio de mensagens
    startWhatsappMessageWorker();
});

process.on("SIGINT", () => {
    logger.warn("Encerrando servidor...");

    server.close(() => {
        logger.success("Servidor encerrado.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    logger.warn("Encerrando servidor...");

    server.close(() => {
        logger.success("Servidor encerrado.");
        process.exit(0);
    });
});