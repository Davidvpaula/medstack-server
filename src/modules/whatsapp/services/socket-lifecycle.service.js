import pino from "pino";

import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import { logger } from "../../../core/logger.js";
import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import { getWhatsappSessionPath } from "./session.service.js";
import { whatsappInstanceManager } from "./instance-manager.service.js";

class WhatsappSocketLifecycleService {
    getSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return whatsappInstanceManager.getSocket(instanceId);
    }

    setSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, socket) {
        whatsappInstanceManager.setSocket(instanceId, socket);
    }

    hasSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return whatsappInstanceManager.hasSocket(instanceId);
    }

    async createSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const { state, saveCreds } = await useMultiFileAuthState(
            getWhatsappSessionPath(instanceId)
        );

        const { version } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: "silent" }),
            browser: ["MedStack", "Chrome", "1.0.0"],
            printQRInTerminal: false,
            markOnlineOnConnect: false,
            syncFullHistory: false,
            connectTimeoutMs: 60_000,
            defaultQueryTimeoutMs: 60_000
        });

        this.setSocket(instanceId, socket);

        logger.info(`Socket WhatsApp criado para instância: ${instanceId}.`);

        return {
            socket,
            saveCreds
        };
    }

    closeSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const socket = this.getSocket(instanceId);

        if (!socket) {
            return;
        }

        try {
            if (typeof socket.end === "function") {
                socket.end(undefined);
            }

            logger.info(`Socket WhatsApp encerrado para instância: ${instanceId}.`);
        } catch (error) {
            logger.warn(`Falha ao encerrar socket WhatsApp da instância: ${instanceId}.`);
        }

        whatsappInstanceManager.removeSocket(instanceId);
    }

    resetSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        this.closeSocket(instanceId);
        whatsappInstanceManager.removeSocket(instanceId);
    }

    isSocketAlive(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return this.hasSocket(instanceId);
    }
}

export const whatsappSocketLifecycle = new WhatsappSocketLifecycleService();