class MessageManager {
    constructor() {
        this.messages = new Map();
    }

    normalizeId(messageId) {
        return String(messageId || "").trim();
    }

    list() {
        return Array.from(this.messages.values());
    }

    findById(messageId) {
        return this.messages.get(this.normalizeId(messageId)) || null;
    }

    listByCompany(companyId) {
        return this.list().filter(
            (message) => message.companyId === companyId
        );
    }

    listByConversation(conversationId) {
        return this.list().filter(
            (message) => message.conversationId === conversationId
        );
    }

    listByContact(contactId) {
        return this.list().filter(
            (message) => message.contactId === contactId
        );
    }

    create(message) {
        this.messages.set(this.normalizeId(message.id), message);

        return message;
    }

    update(messageId, data) {
        const message = this.findById(messageId);

        if (!message) {
            return null;
        }

        message.update(data);

        this.messages.set(this.normalizeId(message.id), message);

        return message;
    }

    remove(messageId) {
        return this.messages.delete(this.normalizeId(messageId));
    }

    clear() {
        this.messages.clear();
    }
}

export const messageManager = new MessageManager();