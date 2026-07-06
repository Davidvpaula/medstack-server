import {
    handleIncomingWhatsAppMessage
} from "./whatsapp-message-handler.service.js";

import {
    resolveCompanyIdFromInstance
} from "./instance-company-resolver.service.js";

import {
    bindPresenceEvents
} from "./socket-presence.service.js";

export async function bindSocketEvents(socket, instanceId) {
    if (!socket) {
        return;
    }

    socket.ev.on("messages.upsert", async (event) => {
        try {
            const messages = event.messages || [];

            for (const rawMessage of messages) {
                await processIncomingSocketMessage(
                    rawMessage,
                    instanceId
                );
            }
        } catch (error) {
            console.error(
                "[WhatsApp Socket] Erro ao processar messages.upsert",
                error
            );
        }
    });

    await bindPresenceEvents(socket);

    console.log("[WhatsApp Socket] Eventos registrados.");
}

async function processIncomingSocketMessage(rawMessage, instanceId) {
    if (!rawMessage?.message) {
        return;
    }

    if (rawMessage.key?.fromMe) {
        return;
    }

    const remoteJid = rawMessage.key?.remoteJid || "";

    if (isGroupMessage(remoteJid)) {
        return;
    }

    const phone = extractPhone(remoteJid);

    if (!phone) {
        return;
    }

    const normalizedMessage = normalizeIncomingMessage(rawMessage);

    if (!normalizedMessage.text && normalizedMessage.type === "system") {
        return;
    }

    const companyId = resolveCompanyIdFromInstance(instanceId);

    await handleIncomingWhatsAppMessage({
        companyId,
        phone,
        name: rawMessage.pushName || phone,
        text: normalizedMessage.text,
        type: normalizedMessage.type,
        media: normalizedMessage.media,
        externalId: rawMessage.key?.id || null,
        provider: "baileys",
        metadata: {
            instanceId,
            remoteJid,
            participant: rawMessage.key?.participant || null,
            fromMe: Boolean(rawMessage.key?.fromMe),
            pushName: rawMessage.pushName || "",
            timestamp: rawMessage.messageTimestamp || null,
            messageKey: rawMessage.key || null,
            rawType: normalizedMessage.rawType,
            location: normalizedMessage.location || null,
            contact: normalizedMessage.contact || null
        }
    });

    console.log("[WhatsApp Inbound] Mensagem processada.", {
        companyId,
        phone,
        type: normalizedMessage.type,
        externalId: rawMessage.key?.id || null
    });
}

function normalizeIncomingMessage(rawMessage) {
    const message = rawMessage.message || {};
    const rawType = Object.keys(message)[0] || "unknown";

    if (message.conversation) {
        return {
            type: "text",
            text: message.conversation,
            media: {},
            rawType
        };
    }

    if (message.extendedTextMessage?.text) {
        return {
            type: "text",
            text: message.extendedTextMessage.text,
            media: {},
            rawType
        };
    }

    if (message.imageMessage) {
        return {
            type: "image",
            text: message.imageMessage.caption || "",
            media: {
                mimeType: message.imageMessage.mimetype || "",
                fileName: "",
                size: message.imageMessage.fileLength || 0
            },
            rawType
        };
    }

    if (message.audioMessage) {
        return {
            type: "audio",
            text: "",
            media: {
                mimeType: message.audioMessage.mimetype || "",
                fileName: "",
                size: message.audioMessage.fileLength || 0
            },
            rawType
        };
    }

    if (message.videoMessage) {
        return {
            type: "video",
            text: message.videoMessage.caption || "",
            media: {
                mimeType: message.videoMessage.mimetype || "",
                fileName: "",
                size: message.videoMessage.fileLength || 0
            },
            rawType
        };
    }

    if (message.documentMessage) {
        return {
            type: "document",
            text: message.documentMessage.caption || "",
            media: {
                mimeType: message.documentMessage.mimetype || "",
                fileName: message.documentMessage.fileName || "",
                size: message.documentMessage.fileLength || 0
            },
            rawType
        };
    }

    if (message.locationMessage) {
        return {
            type: "location",
            text: "",
            media: {},
            rawType,
            location: {
                latitude: message.locationMessage.degreesLatitude,
                longitude: message.locationMessage.degreesLongitude,
                name: message.locationMessage.name || "",
                address: message.locationMessage.address || ""
            }
        };
    }

    if (message.contactMessage) {
        return {
            type: "contact",
            text: message.contactMessage.displayName || "",
            media: {},
            rawType,
            contact: {
                displayName: message.contactMessage.displayName || "",
                vcard: message.contactMessage.vcard || ""
            }
        };
    }

    return {
        type: "system",
        text: "",
        media: {},
        rawType
    };
}

function extractPhone(remoteJid) {
    return String(remoteJid || "")
        .replace("@s.whatsapp.net", "")
        .replace("@c.us", "")
        .replace(/\D/g, "");
}

function isGroupMessage(remoteJid) {
    return String(remoteJid || "").includes("@g.us");
}