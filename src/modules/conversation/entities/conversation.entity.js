import {
    CONVERSATION_STATUS,
    CONVERSATION_CHANNEL,
    CONVERSATION_PRIORITY
} from "../constants/conversation-status.constants.js";

import {
    CONVERSATION_RUNTIME,
    CONVERSATION_ORIGIN
} from "../constants/conversation-runtime.constants.js";

export class Conversation {
    constructor(data = {}) {
        this.id = data.id;

        this.companyId = data.companyId;
        this.contactId = data.contactId;

        this.channel = data.channel || CONVERSATION_CHANNEL.WHATSAPP;
        this.status = data.status || CONVERSATION_STATUS.OPEN;
        this.priority = data.priority || CONVERSATION_PRIORITY.NORMAL;

        this.assignedTo = data.assignedTo || null;

        this.runtime = {
            mode: data.runtime?.mode || CONVERSATION_RUNTIME.WAITING,
            unread: data.runtime?.unread || 0,
            typing: data.runtime?.typing || false,
            aiEnabled: data.runtime?.aiEnabled || false,
            flowEnabled: data.runtime?.flowEnabled || false
        };

        this.statistics = {
            messages: data.statistics?.messages || 0,
            inbound: data.statistics?.inbound || 0,
            outbound: data.statistics?.outbound || 0
        };

        this.title = data.title || "";
        this.summary = data.summary || "";

        this.tags = data.tags || [];
        this.notes = data.notes || [];
        this.metadata = data.metadata || {};

        this.lastMessageId = null;
        this.lastMessageText = "";
        this.lastMessageOrigin = null;
        this.lastMessageAt = null;

        this.closedAt = null;
        this.archivedAt = null;

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    update(data = {}) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();

        return this;
    }

    markMessage(message = {}) {
        this.lastMessageId = message.id || null;
        this.lastMessageText = message.text || "";
        this.lastMessageAt = new Date().toISOString();
        this.updatedAt = this.lastMessageAt;

        return this;
    }

    markInbound(message = {}) {
        this.statistics.messages += 1;
        this.statistics.inbound += 1;

        this.runtime.unread += 1;

        this.lastMessageOrigin = CONVERSATION_ORIGIN.INBOUND;

        this.markMessage(message);

        return this;
    }

    markOutbound(message = {}) {
        this.statistics.messages += 1;
        this.statistics.outbound += 1;

        this.runtime.unread = 0;

        this.lastMessageOrigin = CONVERSATION_ORIGIN.OUTBOUND;

        this.markMessage(message);

        return this;
    }

    setTyping(value) {
        this.runtime.typing = Boolean(value);
        this.updatedAt = new Date().toISOString();

        return this;
    }

    enableAI() {
        this.runtime.aiEnabled = true;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    disableAI() {
        this.runtime.aiEnabled = false;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    enableFlow() {
        this.runtime.flowEnabled = true;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    disableFlow() {
        this.runtime.flowEnabled = false;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    readMessages() {
        this.runtime.unread = 0;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    assign(userId) {
        this.assignedTo = userId;
        this.runtime.mode = CONVERSATION_RUNTIME.HUMAN;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    close() {
        this.status = CONVERSATION_STATUS.CLOSED;
        this.runtime.mode = CONVERSATION_RUNTIME.CLOSED;
        this.closedAt = new Date().toISOString();
        this.updatedAt = this.closedAt;

        return this;
    }

    reopen() {
        this.status = CONVERSATION_STATUS.OPEN;
        this.runtime.mode = CONVERSATION_RUNTIME.WAITING;
        this.closedAt = null;
        this.updatedAt = new Date().toISOString();

        return this;
    }

    archive() {
        this.status = CONVERSATION_STATUS.ARCHIVED;
        this.archivedAt = new Date().toISOString();
        this.updatedAt = this.archivedAt;

        return this;
    }
}