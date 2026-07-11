import app from "./src/app.js";

import {
    env
} from "./src/config/env.js";

import {
    logger
} from "./src/core/logger.js";

import {
    autoStartWhatsappRuntimes
} from "./src/modules/whatsapp/services/whatsapp-autostart.service.js";

import {
    startWhatsappHealthMonitor
} from "./src/modules/whatsapp/services/whatsapp-health-monitor.service.js";

import {
    startWhatsappMessageWorker
} from "./src/modules/whatsapp/workers/whatsapp-message.worker.js";

import {
    listInstanceCompanyBindings
} from "./src/modules/whatsapp/services/instance-company-resolver.service.js";

import {
    flushWhatsappRuntime,
    stopAllWhatsappRuntimeFlushers
} from "./src/modules/whatsapp/services/whatsapp-runtime-flusher.service.js";

import {
    whatsappSocketLifecycle
} from "./src/modules/whatsapp/services/socket-lifecycle.service.js";

import {
    closePostgresPool
} from "./src/database/postgres.client.js";

let shuttingDown = false;

const server = app.listen(
    env.PORT,
    async () => {
        logger.success(
            "MedStack Server iniciado"
        );

        logger.info(
            `Local: http://localhost:${env.PORT}`
        );

        try {
            await autoStartWhatsappRuntimes();

            startWhatsappHealthMonitor();

            startWhatsappMessageWorker();
        } catch (error) {
            logger.error(
                "Falha durante bootstrap do servidor.",
                error
            );
        }
    }
);

process.on(
    "SIGINT",
    () => {
        gracefulShutdown("SIGINT");
    }
);

process.on(
    "SIGTERM",
    () => {
        gracefulShutdown("SIGTERM");
    }
);

process.on(
    "uncaughtException",
    (error) => {
        logger.error(
            "Uncaught Exception.",
            error
        );

        gracefulShutdown(
            "uncaughtException",
            1
        );
    }
);

process.on(
    "unhandledRejection",
    (reason) => {
        logger.error(
            "Unhandled Rejection.",
            reason
        );
    }
);

async function gracefulShutdown(
    signal,
    exitCode = 0
) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    logger.warn(
        `Encerrando servidor. Sinal: ${signal}`
    );

    const bindings =
        listInstanceCompanyBindings();

    for (const binding of bindings) {
        const instanceId =
            binding.instanceId;

        if (!instanceId) {
            continue;
        }

        try {
            await flushWhatsappRuntime(
                instanceId
            );
        } catch (error) {
            logger.warn(
                `Falha ao salvar último snapshot da instância ${instanceId}.`
            );
        }
    }

    stopAllWhatsappRuntimeFlushers();

    for (const binding of bindings) {
        const instanceId =
            binding.instanceId;

        if (!instanceId) {
            continue;
        }

        try {
            whatsappSocketLifecycle.closeSocket(
                instanceId
            );
        } catch (error) {
            logger.warn(
                `Falha ao fechar socket da instância ${instanceId}.`
            );
        }
    }

    try {
        await closePostgresPool();
    } catch (error) {
        logger.warn(
            "Falha ao fechar Pool PostgreSQL."
        );
    }

    const forceExitTimer = setTimeout(() => {
        logger.error(
            "Shutdown excedeu o limite. Encerrando à força."
        );

        process.exit(1);
    }, 10000);

    forceExitTimer.unref?.();

    server.close(() => {
        clearTimeout(forceExitTimer);

        logger.success(
            "Servidor encerrado."
        );

        process.exit(exitCode);
    });
}