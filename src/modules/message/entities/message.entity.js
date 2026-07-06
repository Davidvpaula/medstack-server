import {
    MESSAGE_STATUS
} from "../constants/message.constants.js";

export class Message {
    constructor(data = {}) {
        this.id = data.id;

        this.companyId = data.companyId;
        this.conversationId = data.conversationId;
        this.contactId = data.contactId;

        this.direction = data.direction;
        this.type = data.type || "text";
        this.status = data.status || MESSAGE_STATUS.PENDING;

        this.senderType = data.senderType || null;
        this.senderId = data.senderId || null;

        this.text = data.text || "";
        this.media = data.media || {};

        this.externalId = data.externalId || null;

        this.metadata = data.metadata || {};

        this.error = null;

        this.sentAt = null;
        this.deliveredAt = null;
        this.readAt = null;
        this.failedAt = null;

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    update(data = {}) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();

        return this;
    }

    markSent() {
        this.status = MESSAGE_STATUS.SENT;
        this.sentAt = new Date().toISOString();
        this.updatedAt = this.sentAt;

        return this;
    }

    markDelivered() {
        this.status = MESSAGE_STATUS.DELIVERED;
        this.deliveredAt = new Date().toISOString();
        this.updatedAt = this.deliveredAt;

        return this;
    }

    markRead() {
        this.status = MESSAGE_STATUS.READ;
        this.readAt = new Date().toISOString();
        this.updatedAt = this.readAt;

        return this;
    }

    markFailed(error = "Falha ao processar mensagem.") {
        this.status = MESSAGE_STATUS.FAILED;
        this.error = error;
        this.failedAt = new Date().toISOString();
        this.updatedAt = this.failedAt;

        return this;
    }
}