import { WhatsAppProvider } from "../whatsapp-provider.interface.js";

import { whatsappSocketLifecycle } from "../../services/socket-lifecycle.service.js";
import { whatsappRepository } from "../../repositories/whatsapp.repository.js";

import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../../constants/index.js";

export class BaileysProvider extends WhatsAppProvider {
    constructor() {
        super();

        this.name = "baileys";
        this.status = "idle";
    }

    async start() {
        this.status = "connected";

        return {
            provider: this.name,
            status: this.status,
            message: "Baileys Provider iniciado."
        };
    }

    async stop() {
        this.status = "disconnected";

        return {
            provider: this.name,
            status: this.status,
            message: "Baileys Provider parado."
        };
    }

    async getStatus() {
        return {
            provider: this.name,
            status: this.status
        };
    }

    async sendText({
        to,
        text,
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    }) {
        const socket = whatsappSocketLifecycle.getSocket(instanceId);

        if (!socket || !whatsappRepository.isConnected(instanceId)) {
            return {
                provider: this.name,
                type: "text",
                to,
                text,
                sent: false,
                simulated: true,
                reason: "Socket WhatsApp não conectado."
            };
        }

        const cleanNumber = String(to || "").replace(/\D/g, "");
        const jid = `${cleanNumber}@s.whatsapp.net`;

        const result = await socket.sendMessage(jid, {
            text
        });

        return {
            provider: this.name,
            type: "text",
            to,
            jid,
            text,
            sent: true,
            simulated: false,
            result
        };
    }

    async sendImage({
        to,
        imageUrl,
        caption = "",
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    }) {
        const socket = whatsappSocketLifecycle.getSocket(instanceId);

        if (!socket || !whatsappRepository.isConnected(instanceId)) {
            return {
                provider: this.name,
                type: "image",
                to,
                imageUrl,
                caption,
                sent: false,
                simulated: true,
                reason: "Socket WhatsApp não conectado."
            };
        }

        const cleanNumber = String(to || "").replace(/\D/g, "");
        const jid = `${cleanNumber}@s.whatsapp.net`;

        const result = await socket.sendMessage(jid, {
            image: {
                url: imageUrl
            },
            caption
        });

        return {
            provider: this.name,
            type: "image",
            to,
            jid,
            imageUrl,
            caption,
            sent: true,
            simulated: false,
            result
        };
    }

    async sendAudio({
        to,
        audioUrl,
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    }) {
        const socket = whatsappSocketLifecycle.getSocket(instanceId);

        if (!socket || !whatsappRepository.isConnected(instanceId)) {
            return {
                provider: this.name,
                type: "audio",
                to,
                audioUrl,
                sent: false,
                simulated: true,
                reason: "Socket WhatsApp não conectado."
            };
        }

        const cleanNumber = String(to || "").replace(/\D/g, "");
        const jid = `${cleanNumber}@s.whatsapp.net`;

        const result = await socket.sendMessage(jid, {
            audio: {
                url: audioUrl
            },
            mimetype: "audio/mp4"
        });

        return {
            provider: this.name,
            type: "audio",
            to,
            jid,
            audioUrl,
            sent: true,
            simulated: false,
            result
        };
    }

    async sendDocument({
        to,
        documentUrl,
        fileName,
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
    }) {
        const socket = whatsappSocketLifecycle.getSocket(instanceId);

        if (!socket || !whatsappRepository.isConnected(instanceId)) {
            return {
                provider: this.name,
                type: "document",
                to,
                documentUrl,
                fileName,
                sent: false,
                simulated: true,
                reason: "Socket WhatsApp não conectado."
            };
        }

        const cleanNumber = String(to || "").replace(/\D/g, "");
        const jid = `${cleanNumber}@s.whatsapp.net`;

        const result = await socket.sendMessage(jid, {
            document: {
                url: documentUrl
            },
            fileName
        });

        return {
            provider: this.name,
            type: "document",
            to,
            jid,
            documentUrl,
            fileName,
            sent: true,
            simulated: false,
            result
        };
    }

    async markAsRead({
        messageId
    }) {
        return {
            provider: this.name,
            messageId,
            read: true
        };
    }

    async typing({
        to,
        value
    }) {
        return {
            provider: this.name,
            to,
            typing: Boolean(value)
        };
    }
}