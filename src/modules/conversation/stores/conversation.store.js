import { conversationManager } from "../services/conversation-manager.service.js";

export function getConversations() {
    return conversationManager.list();
}

export function getConversationById(conversationId) {
    return conversationManager.findById(conversationId);
}

export function getConversationsByCompany(companyId) {
    return conversationManager.listByCompany(companyId);
}

export function getConversationsByContact(contactId) {
    return conversationManager.listByContact(contactId);
}

export function getOpenConversationByContact(companyId, contactId, channel) {
    return conversationManager.findOpenByContact(
        companyId,
        contactId,
        channel
    );
}

export function addConversation(conversation) {
    return conversationManager.create(conversation);
}

export function updateConversation(conversationId, data) {
    return conversationManager.update(conversationId, data);
}

export function removeConversation(conversationId) {
    return conversationManager.remove(conversationId);
}

export function clearConversations() {
    return conversationManager.clear();
}