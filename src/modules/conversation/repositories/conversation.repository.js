import {
    getConversations,
    getConversationById,
    getConversationsByCompany,
    getConversationsByContact,
    getOpenConversationByContact,
    addConversation,
    updateConversation,
    removeConversation
} from "../stores/conversation.store.js";

export const conversationRepository = {
    list() {
        return getConversations();
    },

    findById(conversationId) {
        return getConversationById(conversationId);
    },

    listByCompany(companyId) {
        return getConversationsByCompany(companyId);
    },

    listByContact(contactId) {
        return getConversationsByContact(contactId);
    },

    findOpenByContact(companyId, contactId, channel) {
        return getOpenConversationByContact(
            companyId,
            contactId,
            channel
        );
    },

    create(conversation) {
        return addConversation(conversation);
    },

    update(conversationId, data) {
        return updateConversation(conversationId, data);
    },

    remove(conversationId) {
        return removeConversation(conversationId);
    }
};