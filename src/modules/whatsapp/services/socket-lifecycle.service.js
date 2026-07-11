import pino from "pino";

import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import { logger } from "../../../core/logger.js";

import {
    WHATSAPP_DEFAULT_INSTANCE_ID
} from "../../../constants/index.js";

import {
    getWhatsappSessionPath
} from "./session.service.js";

import {
    whatsappInstanceManager
} from "./instance-manager.service.js";

import {
    persistWhatsappRuntimeSafely,
    persistWhatsappDisconnectedSafely
} from "./whatsapp-runtime-persistence.service.js";

class WhatsappSocketLifecycleService {
    getSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        return whatsappInstanceManager.getSocket(
            instanceId
        );
    }

    setSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID,
        socket
    ) {
        const instance =
            whatsappInstanceManager.setSocket(
                instanceId,
                socket
            );

        persistWhatsappRuntimeSafely(instanceId);

        return instance;
    }

    hasSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        return whatsappInstanceManager.hasSocket(
            instanceId
        );
    }

    async createSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(
            getWhatsappSessionPath(instanceId)
        );

        const {
            version
        } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            auth: state,
            logger: pino({
                level: "silent"
            }),
            browser: [
                "MedStack",
                "Chrome",
                "1.0.0"
            ],
            printQRInTerminal: false,
            markOnlineOnConnect: false,
            syncFullHistory: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000
        });

        this.setSocket(
            instanceId,
            socket
        );

        logger.info(
            `Socket WhatsApp criado para instância: ${instanceId}.`
        );

        return {
            socket,
            saveCreds
        };
    }

    closeSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        const socket = this.getSocket(
            instanceId
        );

        if (!socket) {
            persistWhatsappDisconnectedSafely(
                instanceId,
                "socket_not_found"
            );

            return {
                closed: false,
                instanceId
            };
        }

        try {
            if (
                typeof socket.end === "function"
            ) {
                socket.end(undefined);
            }

            logger.info(
                `Socket WhatsApp encerrado para instância: ${instanceId}.`
            );
        } catch (error) {
            logger.warn(
                `Falha ao encerrar socket WhatsApp da instância: ${instanceId}.`
            );
        }

        whatsappInstanceManager.removeSocket(
            instanceId
        );

        persistWhatsappDisconnectedSafely(
            instanceId,
            "socket_closed"
        );

        return {
            closed: true,
            instanceId
        };
    }

    resetSocket(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        this.closeSocket(instanceId);

        whatsappInstanceManager.removeSocket(
            instanceId
        );

        persistWhatsappRuntimeSafely(
            instanceId
        );

        return {
            reset: true,
            instanceId
        };
    }

    isSocketAlive(
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    ) {
        return this.hasSocket(instanceId);
    }
}

export const whatsappSocketLifecycle =
    new WhatsappSocketLifecycleService();