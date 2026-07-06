class ConversationManager {
    constructor() {
        this.conversations = new Map();
    }

    normalizeId(conversationId) {
        return String(conversationId || "").trim();
    }

    list() {
        return Array.from(this.conversations.values());
    }

    findById(conversationId) {
        return this.conversations.get(this.normalizeId(conversationId)) || null;
    }

    listByCompany(companyId) {
        return this.list().filter(
            (conversation) => conversation.companyId === companyId
        );
    }

    listByContact(contactId) {
        return this.list().filter(
            (conversation) => conversation.contactId === contactId
        );
    }

    findOpenByContact(companyId, contactId, channel) {
        return this.list().find(
            (conversation) =>
                conversation.companyId === companyId &&
                conversation.contactId === contactId &&
                conversation.channel === channel &&
                conversation.status === "open"
        ) || null;
    }

    create(conversation) {
        this.conversations.set(
            this.normalizeId(conversation.id),
            conversation
        );

        return conversation;
    }

    update(conversationId, data) {
        const conversation = this.findById(conversationId);

        if (!conversation) {
            return null;
        }

        conversation.update(data);

        this.conversations.set(
            this.normalizeId(conversation.id),
            conversation
        );

        return conversation;
    }

    remove(conversationId) {
        return this.conversations.delete(
            this.normalizeId(conversationId)
        );
    }

    clear() {
        this.conversations.clear();
    }
}

export const conversationManager = new ConversationManager();