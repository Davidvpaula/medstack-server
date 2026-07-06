import {
    getMessages,
    getMessageById,
    getMessagesByCompany,
    getMessagesByConversation,
    getMessagesByContact,
    addMessage,
    updateMessage,
    removeMessage
} from "../stores/message.store.js";

export const messageRepository = {
    list() {
        return getMessages();
    },

    findById(messageId) {
        return getMessageById(messageId);
    },

    listByCompany(companyId) {
        return getMessagesByCompany(companyId);
    },

    listByConversation(conversationId) {
        return getMessagesByConversation(conversationId);
    },

    listByContact(contactId) {
        return getMessagesByContact(contactId);
    },

    create(message) {
        return addMessage(message);
    },

    update(messageId, data) {
        return updateMessage(messageId, data);
    },

    remove(messageId) {
        return removeMessage(messageId);
    }
};