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

import {
    messagePostgresRepository
} from "../../../database/repositories/message.postgres.repository.js";

import {
    MESSAGE_DIRECTION,
    MESSAGE_STATUS,
    MESSAGE_TYPE,
    MESSAGE_SENDER_TYPE
} from "../constants/message.constants.js";

export function getMessageStatus() {
    return {
        module: "message",
        status: "active",
        persistence: "postgres"
    };
}

export async function listMessages() {
    return messagePostgresRepository.listMessages();
}

export async function listMessagesByCompany(companyId) {
    await ensureCompanyExists(companyId);

    return messagePostgresRepository.listMessagesByCompany(companyId);
}

export async function listMessagesByConversation(conversationId) {
    const conversation = await ensureConversationExists(conversationId);

    return messagePostgresRepository.listMessagesByConversation(
        conversation.companyId,
        conversation.id
    );
}

export async function listMessagesByContact(contactId) {
    await ensureContactExists(contactId);

    return messagePostgresRepository.listMessagesByContact(contactId);
}

export async function getMessageById(messageId) {
    const message = await messagePostgresRepository.findMessageById(messageId);

    if (!message) {
        throw new AppError("Mensagem não encontrada.", 404);
    }

    return normalizeMessageOutput(message);
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

    const company = await ensureCompanyExists(data.companyId);
    const conversation = await ensureConversationExists(data.conversationId);
    const contact = await ensureContactExists(data.contactId);

    if (conversation.companyId !== company.id) {
        throw new AppError("Conversa não pertence a esta empresa.", 403);
    }

    if (contact.companyId !== company.id) {
        throw new AppError("Contato não pertence a esta empresa.", 403);
    }

    const direction = data.direction || MESSAGE_DIRECTION.INBOUND;
    const status = data.status || MESSAGE_STATUS.PENDING;
    const type = data.type || MESSAGE_TYPE.TEXT;

    const message = await messagePostgresRepository.createMessage({
        companyId: company.id,
        conversationId: conversation.id,
        contactId: contact.id,
        whatsappInstanceId: data.whatsappInstanceId || conversation.whatsappInstanceId || null,
        externalId: data.externalId || null,
        direction,
        type,
        content: data.content || data.text || "",
        status,
        provider: data.provider || "baileys",
        metadata: {
            senderType: data.senderType || MESSAGE_SENDER_TYPE.CONTACT,
            senderId: data.senderId || null,
            text: data.text || data.content || "",
            media: data.media || {},
            ...(data.metadata || {})
        }
    });

    await conversationPostgresRepository.markLastMessage(conversation.id);

    return normalizeMessageOutput(message);
}

export async function updateMessage(messageId, data) {
    await getMessageById(messageId);

    const updated = await messagePostgresRepository.updateMessage(messageId, {
        ...data,
        content: data.content || data.text,
        metadata: {
            ...(data.metadata || {}),
            text: data.text || data.content,
            media: data.media
        }
    });

    return normalizeMessageOutput(updated);
}

export async function deleteMessage(messageId) {
    await getMessageById(messageId);

    await messagePostgresRepository.softDeleteMessage(messageId);

    return {
        deleted: true,
        messageId
    };
}

export async function markMessageSent(messageId) {
    await getMessageById(messageId);

    const message = await messagePostgresRepository.markSent(messageId);

    return normalizeMessageOutput(message);
}

export async function markMessageDelivered(messageId) {
    await getMessageById(messageId);

    const message = await messagePostgresRepository.markDelivered(messageId);

    return normalizeMessageOutput(message);
}

export async function markMessageRead(messageId) {
    await getMessageById(messageId);

    const message = await messagePostgresRepository.markRead(messageId);

    return normalizeMessageOutput(message);
}

export async function markMessageFailed(messageId, error) {
    await getMessageById(messageId);

    const message = await messagePostgresRepository.markFailed(messageId, error);

    return normalizeMessageOutput(message);
}

async function ensureCompanyExists(companyId) {
    const company = await companyPostgresRepository.findCompanyById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

async function ensureConversationExists(conversationId) {
    const conversation = await conversationPostgresRepository.findConversationById(
        conversationId
    );

    if (!conversation) {
        throw new AppError("Conversa não encontrada.", 404);
    }

    return conversation;
}

async function ensureContactExists(contactId) {
    const contact = await contactPostgresRepository.findContactById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

function normalizeMessageOutput(message) {
    if (!message) {
        return null;
    }

    return {
        ...message,
        text: message.metadata?.text || message.content || "",
        media: message.metadata?.media || {},
        senderType: message.metadata?.senderType || null,
        senderId: message.metadata?.senderId || null
    };
}