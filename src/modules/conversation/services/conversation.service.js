import { AppError } from "../../../core/errors/AppError.js";

import {
    companyPostgresRepository
} from "../../../database/repositories/company.postgres.repository.js";

import {
    contactPostgresRepository
} from "../../../database/repositories/contact.postgres.repository.js";

import {
    conversationPostgresRepository
} from "../../../database/repositories/conversation.postgres.repository.js";

import { createMessage } from "../../message/services/message.service.js";

import {
    MESSAGE_DIRECTION,
    MESSAGE_SENDER_TYPE
} from "../../message/constants/message.constants.js";

import {
    CONVERSATION_STATUS,
    CONVERSATION_CHANNEL,
    CONVERSATION_PRIORITY
} from "../constants/conversation-status.constants.js";

export function getConversationStatus() {
    return {
        module: "conversation",
        status: "active",
        persistence: "postgres"
    };
}

export async function listConversations() {
    return conversationPostgresRepository.listConversations();
}

export async function listConversationsByCompany(companyId) {
    await ensureCompanyExists(companyId);

    return conversationPostgresRepository.listConversationsByCompany(companyId);
}

export async function listConversationsByContact(contactId) {
    await ensureContactExists(contactId);

    return conversationPostgresRepository.listConversationsByContact(contactId);
}

export async function getConversationById(conversationId) {
    const conversation =
        await conversationPostgresRepository.findConversationById(conversationId);

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

    const company = await ensureCompanyExists(data.companyId);
    const contact = await ensureContactExists(data.contactId);

    if (contact.companyId !== company.id) {
        throw new AppError("Contato não pertence a esta empresa.", 403);
    }

    const channel = data.channel || CONVERSATION_CHANNEL.WHATSAPP;

    const existingOpenConversation =
        await conversationPostgresRepository.findOpenByContact(
            company.id,
            contact.id,
            channel
        );

    if (existingOpenConversation) {
        return existingOpenConversation;
    }

    return conversationPostgresRepository.createConversation({
        companyId: company.id,
        contactId: contact.id,
        whatsappInstanceId: data.whatsappInstanceId || null,
        channel,
        status: data.status || CONVERSATION_STATUS.OPEN,
        assignedUserId: data.assignedTo || data.assignedUserId || null,
        metadata: {
            priority: data.priority || CONVERSATION_PRIORITY.NORMAL,
            assignedTo: data.assignedTo || null,
            title: data.title || contact.name || "",
            summary: data.summary || "",
            tags: data.tags || [],
            notes: data.notes || [],
            typing: false,
            aiEnabled: false,
            flowEnabled: false,
            unreadMessages: 0,
            ...(data.metadata || {})
        }
    });
}

export async function updateConversation(conversationId, data) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        contactId: data.contactId,
        whatsappInstanceId: data.whatsappInstanceId,
        status: data.status,
        channel: data.channel,
        lastMessageAt: data.lastMessageAt,
        assignedUserId: data.assignedUserId || data.assignedTo,
        metadata: {
            ...(conversation.metadata || {}),
            ...buildConversationMetadata(data)
        }
    });
}

export async function assignConversation(conversationId, userId) {
    if (!userId) {
        throw new AppError("Informe userId.", 400);
    }

    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        assignedUserId: userId,
        metadata: {
            ...(conversation.metadata || {}),
            assignedTo: userId
        }
    });
}

export async function closeConversation(conversationId) {
    const conversation = await getConversationById(conversationId);

    if (conversation.status === CONVERSATION_STATUS.CLOSED) {
        return conversation;
    }

    return conversationPostgresRepository.updateConversation(conversationId, {
        status: CONVERSATION_STATUS.CLOSED,
        metadata: {
            ...(conversation.metadata || {}),
            closedAt: new Date().toISOString()
        }
    });
}

export async function reopenConversation(conversationId) {
    const conversation = await getConversationById(conversationId);

    if (conversation.status === CONVERSATION_STATUS.OPEN) {
        return conversation;
    }

    return conversationPostgresRepository.updateConversation(conversationId, {
        status: CONVERSATION_STATUS.OPEN,
        metadata: {
            ...(conversation.metadata || {}),
            reopenedAt: new Date().toISOString()
        }
    });
}

export async function archiveConversation(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        status: CONVERSATION_STATUS.ARCHIVED,
        metadata: {
            ...(conversation.metadata || {}),
            archived: true,
            archivedAt: new Date().toISOString()
        }
    });
}

export async function deleteConversation(conversationId) {
    await getConversationById(conversationId);

    await conversationPostgresRepository.softDeleteConversation(conversationId);

    return {
        deleted: true,
        conversationId
    };
}

export async function markConversationInbound(conversationId, data = {}) {
    const conversation = await getConversationById(conversationId);

    const message = await createMessage({
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

    await conversationPostgresRepository.markLastMessage(conversation.id);

    return message;
}

export async function markConversationOutbound(conversationId, data = {}) {
    const conversation = await getConversationById(conversationId);

    const message = await createMessage({
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

    await conversationPostgresRepository.markLastMessage(conversation.id);

    return message;
}

export async function setConversationTyping(conversationId, value) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            typing: Boolean(value)
        }
    });
}

export async function enableConversationAI(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            aiEnabled: true
        }
    });
}

export async function disableConversationAI(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            aiEnabled: false
        }
    });
}

export async function enableConversationFlow(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            flowEnabled: true
        }
    });
}

export async function disableConversationFlow(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            flowEnabled: false
        }
    });
}

export async function readConversationMessages(conversationId) {
    const conversation = await getConversationById(conversationId);

    return conversationPostgresRepository.updateConversation(conversationId, {
        metadata: {
            ...(conversation.metadata || {}),
            unreadMessages: 0,
            lastReadAt: new Date().toISOString()
        }
    });
}

async function ensureCompanyExists(companyId) {
    const company = await companyPostgresRepository.findCompanyById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

async function ensureContactExists(contactId) {
    const contact = await contactPostgresRepository.findContactById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

function buildConversationMetadata(data = {}) {
    return {
        priority: data.priority,
        assignedTo: data.assignedTo,
        title: data.title,
        summary: data.summary,
        tags: data.tags,
        notes: data.notes,
        typing: data.typing,
        aiEnabled: data.aiEnabled,
        flowEnabled: data.flowEnabled,
        unreadMessages: data.unreadMessages,
        ...(data.metadata || {})
    };
}