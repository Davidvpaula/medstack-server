import { WhatsAppProvider } from "../whatsapp-provider.interface.js";

export class MetaProvider extends WhatsAppProvider {
    constructor() {
        super();

        this.name = "meta";
        this.status = "idle";
    }

    async start() {
        this.status = "connected";

        return {
            provider: this.name,
            status: this.status,
            message: "Meta Provider iniciado."
        };
    }

    async stop() {
        this.status = "disconnected";

        return {
            provider: this.name,
            status: this.status,
            message: "Meta Provider parado."
        };
    }

    async getStatus() {
        return {
            provider: this.name,
            status: this.status
        };
    }

    async sendText({ to, text }) {
        return {
            provider: this.name,
            type: "text",
            to,
            text,
            sent: true
        };
    }

    async sendImage({ to, imageUrl, caption = "" }) {
        return {
            provider: this.name,
            type: "image",
            to,
            imageUrl,
            caption,
            sent: true
        };
    }

    async sendAudio({ to, audioUrl }) {
        return {
            provider: this.name,
            type: "audio",
            to,
            audioUrl,
            sent: true
        };
    }

    async sendDocument({ to, documentUrl, fileName }) {
        return {
            provider: this.name,
            type: "document",
            to,
            documentUrl,
            fileName,
            sent: true
        };
    }

    async markAsRead({ messageId }) {
        return {
            provider: this.name,
            messageId,
            read: true
        };
    }

    async typing({ to, value }) {
        return {
            provider: this.name,
            to,
            typing: Boolean(value)
        };
    }
}