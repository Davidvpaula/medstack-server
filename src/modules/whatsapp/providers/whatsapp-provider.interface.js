export class WhatsAppProvider {
    constructor() {
        if (new.target === WhatsAppProvider) {
            throw new Error("WhatsAppProvider não pode ser instanciado diretamente.");
        }
    }

    async start() {
        throw new Error("Método start() não implementado.");
    }

    async stop() {
        throw new Error("Método stop() não implementado.");
    }

    async getStatus() {
        throw new Error("Método getStatus() não implementado.");
    }

    async sendText() {
        throw new Error("Método sendText() não implementado.");
    }

    async sendImage() {
        throw new Error("Método sendImage() não implementado.");
    }

    async sendAudio() {
        throw new Error("Método sendAudio() não implementado.");
    }

    async sendDocument() {
        throw new Error("Método sendDocument() não implementado.");
    }

    async markAsRead() {
        throw new Error("Método markAsRead() não implementado.");
    }

    async typing() {
        throw new Error("Método typing() não implementado.");
    }
}