import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";
import { contactRepository } from "../../contact/repositories/contact.repository.js";

import { createMessage } from "../../message/services/message.service.js";

import {
    MESSAGE_DIRECTION,
    MESSAGE_SENDER_TYPE
} from "../../message/constants/message.constants.js";

import { Conversation } from "../entities/conversation.entity.js";
import { conversationRepository } from "../repositories/conversation.repository.js";

import {
    CONVERSATION_STATUS,
    CONVERSATION_CHANNEL,
    CONVERSATION_PRIORITY
} from "../constants/conversation-status.constants.js";

export function getConversationStatus() {
    return {
        module: "conversation",
        status: "active"
    };
}

export function listConversations() {
    return conversationRepository.list();
}

export function listConversationsByCompany(companyId) {
    ensureCompanyExists(companyId);

    return conversationRepository.listByCompany(companyId);
}

export function listConversationsByContact(contactId) {
    ensureContactExists(contactId);

    return conversationRepository.listByContact(contactId);
}

export function getConversationById(conversationId) {
    const conversation = conversationRepository.findById(conversationId);

    if (!conversation) {
        throw new AppError("Conversa não encontrada.", 404);
    }

    return conversation;
}

export async function createConversation(data) {
    if (!data?.companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    if (!data?.contactId) {
        throw new AppError("Informe contactId.", 400);
    }

    const company = ensureCompanyExists(data.companyId);
    const contact = ensureContactExists(data.contactId);

    if (contact.companyId !== company.id) {
        throw new AppError("Contato não pertence a esta empresa.", 403);
    }

    const channel = data.channel || CONVERSATION_CHANNEL.WHATSAPP;

    const existingOpenConversation = conversationRepository.findOpenByContact(
        company.id,
        contact.id,
        channel
    );

    if (existingOpenConversation) {
        return existingOpenConversation;
    }

    const conversation = new Conversation({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: company.id,
        contactId: contact.id,
        channel,
        status: data.status || CONVERSATION_STATUS.OPEN,
        priority: data.priority || CONVERSATION_PRIORITY.NORMAL,
        assignedTo: data.assignedTo || null,
        title: data.title || contact.name,
        summary: data.summary || "",
        tags: data.tags || [],
        notes: data.notes || [],
        metadata: data.metadata || {}
    });

    company.updateRuntime({
        activeConversations: (company.runtime.activeConversations || 0) + 1
    });

    company.updateStatistics({
        conversations: (company.statistics.conversations || 0) + 1
    });

    contact.markActivity();

    return conversationRepository.create(conversation);
}

export async function updateConversation(conversationId, data) {
    getConversationById(conversationId);

    return conversationRepository.update(conversationId, data);
}

export async function assignConversation(conversationId, userId) {
    if (!userId) {
        throw new AppError("Informe userId.", 400);
    }

    const conversation = getConversationById(conversationId);

    conversation.assign(userId);

    return conversation;
}

export async function closeConversation(conversationId) {
    const conversation = getConversationById(conversationId);

    if (conversation.status === CONVERSATION_STATUS.CLOSED) {
        return conversation;
    }

    conversation.close();

    const company = companyRepository.findById(conversation.companyId);

    if (company) {
        company.updateRuntime({
            activeConversations: Math.max(
                (company.runtime.activeConversations || 1) - 1,
                0
            )
        });
    }

    return conversation;
}

export async function reopenConversation(conversationId) {
    const conversation = getConversationById(conversationId);

    if (conversation.status === CONVERSATION_STATUS.OPEN) {
        return conversation;
    }

    conversation.reopen();

    const company = companyRepository.findById(conversation.companyId);

    if (company) {
        company.updateRuntime({
            activeConversations: (company.runtime.activeConversations || 0) + 1
        });
    }

    return conversation;
}

export async function archiveConversation(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.archive();

    return conversation;
}

export async function deleteConversation(conversationId) {
    getConversationById(conversationId);

    conversationRepository.remove(conversationId);

    return {
        deleted: true,
        conversationId
    };
}

export async function markConversationInbound(conversationId, data = {}) {
    const conversation = getConversationById(conversationId);

    return createMessage({
        companyId: conversation.companyId,
        conversationId: conversation.id,
        contactId: conversation.contactId,
        direction: MESSAGE_DIRECTION.INBOUND,
        senderType: MESSAGE_SENDER_TYPE.CONTACT,
        senderId: conversation.contactId,
        text: data.text || "",
        type: data.type,
        media: data.media,
        metadata: data.metadata || {},
        externalId: data.externalId || null
    });
}

export async function markConversationOutbound(conversationId, data = {}) {
    const conversation = getConversationById(conversationId);

    return createMessage({
        companyId: conversation.companyId,
        conversationId: conversation.id,
        contactId: conversation.contactId,
        direction: MESSAGE_DIRECTION.OUTBOUND,
        senderType: data.senderType || MESSAGE_SENDER_TYPE.USER,
        senderId: data.senderId || null,
        text: data.text || "",
        type: data.type,
        media: data.media,
        metadata: data.metadata || {},
        externalId: data.externalId || null
    });
}

export async function setConversationTyping(conversationId, value) {
    const conversation = getConversationById(conversationId);

    conversation.setTyping(value);

    return conversation;
}

export async function enableConversationAI(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.enableAI();

    return conversation;
}

export async function disableConversationAI(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.disableAI();

    return conversation;
}

export async function enableConversationFlow(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.enableFlow();

    return conversation;
}

export async function disableConversationFlow(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.disableFlow();

    return conversation;
}

export async function readConversationMessages(conversationId) {
    const conversation = getConversationById(conversationId);

    conversation.readMessages();

    return conversation;
}

function ensureCompanyExists(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function ensureContactExists(contactId) {
    const contact = contactRepository.findById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}