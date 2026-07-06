import { messageManager } from "../services/message-manager.service.js";

export function getMessages() {
    return messageManager.list();
}

export function getMessageById(messageId) {
    return messageManager.findById(messageId);
}

export function getMessagesByCompany(companyId) {
    return messageManager.listByCompany(companyId);
}

export function getMessagesByConversation(conversationId) {
    return messageManager.listByConversation(conversationId);
}

export function getMessagesByContact(contactId) {
    return messageManager.listByContact(contactId);
}

export function addMessage(message) {
    return messageManager.create(message);
}

export function updateMessage(messageId, data) {
    return messageManager.update(messageId, data);
}

export function removeMessage(messageId) {
    return messageManager.remove(messageId);
}