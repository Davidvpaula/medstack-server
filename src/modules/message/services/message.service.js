import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";
import { contactRepository } from "../../contact/repositories/contact.repository.js";
import { conversationRepository } from "../../conversation/repositories/conversation.repository.js";

import { Message } from "../entities/message.entity.js";
import { messageRepository } from "../repositories/message.repository.js";

import {
    MESSAGE_DIRECTION,
    MESSAGE_STATUS,
    MESSAGE_TYPE,
    MESSAGE_SENDER_TYPE
} from "../constants/message.constants.js";

export function getMessageStatus() {
    return {
        module: "message",
        status: "active"
    };
}

export function listMessages() {
    return messageRepository.list();
}

export function listMessagesByCompany(companyId) {
    ensureCompanyExists(companyId);

    return messageRepository.listByCompany(companyId);
}

export function listMessagesByConversation(conversationId) {
    ensureConversationExists(conversationId);

    return messageRepository.listByConversation(conversationId);
}

export function listMessagesByContact(contactId) {
    ensureContactExists(contactId);

    return messageRepository.listByContact(contactId);
}

export function getMessageById(messageId) {
    const message = messageRepository.findById(messageId);

    if (!message) {
        throw new AppError("Mensagem não encontrada.", 404);
    }

    return message;
}

export async function createMessage(data) {
    if (!data?.companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    if (!data?.conversationId) {
        throw new AppError("Informe conversationId.", 400);
    }

    if (!data?.contactId) {
        throw new AppError("Informe contactId.", 400);
    }

    const company = ensureCompanyExists(data.companyId);
    const conversation = ensureConversationExists(data.conversationId);
    const contact = ensureContactExists(data.contactId);

    if (conversation.companyId !== company.id) {
        throw new AppError("Conversa não pertence a esta empresa.", 403);
    }

    if (contact.companyId !== company.id) {
        throw new AppError("Contato não pertence a esta empresa.", 403);
    }

    const message = new Message({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: company.id,
        conversationId: conversation.id,
        contactId: contact.id,
        direction: data.direction || MESSAGE_DIRECTION.INBOUND,
        type: data.type || MESSAGE_TYPE.TEXT,
        status: data.status || MESSAGE_STATUS.PENDING,
        senderType: data.senderType || MESSAGE_SENDER_TYPE.CONTACT,
        senderId: data.senderId || null,
        text: data.text || "",
        media: data.media || {},
        metadata: data.metadata || {},
        externalId: data.externalId || null
    });

    const savedMessage = messageRepository.create(message);

    if (savedMessage.direction === MESSAGE_DIRECTION.INBOUND) {
        conversation.markInbound(savedMessage);
    }

    if (savedMessage.direction === MESSAGE_DIRECTION.OUTBOUND) {
        conversation.markOutbound(savedMessage);
    }

    company.updateStatistics({
        totalMessages: (company.statistics.totalMessages || 0) + 1,
        monthlyMessages: (company.statistics.monthlyMessages || 0) + 1
    });

    contact.markActivity();

    return savedMessage;
}

export async function updateMessage(messageId, data) {
    getMessageById(messageId);

    return messageRepository.update(messageId, data);
}

export async function deleteMessage(messageId) {
    getMessageById(messageId);

    messageRepository.remove(messageId);

    return {
        deleted: true,
        messageId
    };
}

export async function markMessageSent(messageId) {
    const message = getMessageById(messageId);

    message.markSent();

    return message;
}

export async function markMessageDelivered(messageId) {
    const message = getMessageById(messageId);

    message.markDelivered();

    return message;
}

export async function markMessageRead(messageId) {
    const message = getMessageById(messageId);

    message.markRead();

    return message;
}

export async function markMessageFailed(messageId, error) {
    const message = getMessageById(messageId);

    message.markFailed(error);

    return message;
}

function ensureCompanyExists(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function ensureConversationExists(conversationId) {
    const conversation = conversationRepository.findById(conversationId);

    if (!conversation) {
        throw new AppError("Conversa não encontrada.", 404);
    }

    return conversation;
}

function ensureContactExists(contactId) {
    const contact = contactRepository.findById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}