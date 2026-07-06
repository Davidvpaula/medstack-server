import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import {
    removeWhatsappSession
} from "../services/session.service.js";

import { whatsappConnectionManager } from "../services/connection-manager.service.js";
import { whatsappSocketLifecycle } from "../services/socket-lifecycle.service.js";

import { handleConnectionUpdate } from "../events/connection-update.event.js";

import { processOutgoingWhatsappMessage } from "../services/message.service.js";

import { bindSocketEvents } from "../services/socket-events.service.js";

import { whatsappRepository } from "../repositories/whatsapp.repository.js";

export async function startWhatsappSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    if (whatsappConnectionManager.shouldSkipStart(instanceId)) {
        return;
    }

    try {
        whatsappConnectionManager.markStarting(instanceId);

        const {
            socket,
            saveCreds
        } = await whatsappSocketLifecycle.createSocket(instanceId);

        socket.ev.on("creds.update", saveCreds);

        socket.ev.on("connection.update", async (update) => {
            await handleConnectionUpdate(
                update,
                startWhatsappSocket,
                instanceId
            );
        });

        await bindSocketEvents(
            socket,
            instanceId
        );
    } catch (error) {
        whatsappConnectionManager.markError(error, instanceId);
        throw error;
    }
}

export async function sendWhatsappSocketMessage(
    number,
    text,
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const socket = whatsappSocketLifecycle.getSocket(instanceId);

    if (!socket || !whatsappRepository.isConnected(instanceId)) {
        throw new Error("WhatsApp não conectado.");
    }

    const cleanNumber = String(number).replace(/\D/g, "");
    const jid = `${cleanNumber}@s.whatsapp.net`;

    await socket.sendMessage(jid, {
        text
    });

    await processOutgoingWhatsappMessage(
        jid,
        text,
        instanceId
    );

    return true;
}

export async function restartWhatsappSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    whatsappConnectionManager.resetRuntime(instanceId);
    whatsappConnectionManager.markRestarting(instanceId);

    whatsappRepository.clearMessages(instanceId);

    await removeWhatsappSession(instanceId);

    await startWhatsappSocket(instanceId);
}