import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";
import { contactRepository } from "../../contact/repositories/contact.repository.js";
import { conversationRepository } from "../../conversation/repositories/conversation.repository.js";
import { messageRepository } from "../../message/repositories/message.repository.js";

export function getInboxStatus() {
    return {
        module: "inbox",
        status: "active"
    };
}

export function getCompanyInbox(companyId) {
    ensureCompanyExists(companyId);

    const conversations = conversationRepository.listByCompany(companyId);

    return conversations.map(buildInboxItem);
}

export function getOpenInbox(companyId) {
    return getCompanyInbox(companyId).filter(
        (item) => item.status === "open"
    );
}

export function getUnreadInbox(companyId) {
    return getCompanyInbox(companyId).filter(
        (item) => item.runtime.unread > 0
    );
}

export function getClosedInbox(companyId) {
    return getCompanyInbox(companyId).filter(
        (item) => item.status === "closed"
    );
}

export function getArchivedInbox(companyId) {
    return getCompanyInbox(companyId).filter(
        (item) => item.status === "archived"
    );
}

export function getAssignedInbox(companyId, userId) {
    if (!userId) {
        throw new AppError("Informe userId.", 400);
    }

    return getCompanyInbox(companyId).filter(
        (item) => item.assignedTo === userId
    );
}

export function getInboxStats(companyId) {
    const inbox = getCompanyInbox(companyId);

    return {
        total: inbox.length,
        open: inbox.filter((item) => item.status === "open").length,
        closed: inbox.filter((item) => item.status === "closed").length,
        archived: inbox.filter((item) => item.status === "archived").length,
        unread: inbox.filter((item) => item.runtime.unread > 0).length,
        waiting: inbox.filter((item) => item.runtime.mode === "waiting").length,
        human: inbox.filter((item) => item.runtime.mode === "human").length,
        aiEnabled: inbox.filter((item) => item.runtime.aiEnabled === true).length,
        flowEnabled: inbox.filter((item) => item.runtime.flowEnabled === true).length
    };
}

function buildInboxItem(conversation) {
    const contact = contactRepository.findById(conversation.contactId);

    const messages = messageRepository.listByConversation(conversation.id);

    const lastMessage = messages[messages.length - 1] || null;

    return {
        conversationId: conversation.id,
        companyId: conversation.companyId,
        contactId: conversation.contactId,

        contact: contact
            ? {
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                phoneNormalized: contact.phoneNormalized,
                avatar: contact.avatar,
                tags: contact.tags,
                favorite: contact.favorite,
                blocked: contact.blocked,
                archived: contact.archived
            }
            : null,

        channel: conversation.channel,
        status: conversation.status,
        priority: conversation.priority,
        assignedTo: conversation.assignedTo,

        title: conversation.title,
        summary: conversation.summary,

        runtime: conversation.runtime,
        statistics: conversation.statistics,

        lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                text: lastMessage.text,
                direction: lastMessage.direction,
                type: lastMessage.type,
                status: lastMessage.status,
                createdAt: lastMessage.createdAt
            }
            : null,

        lastMessageId: conversation.lastMessageId,
        lastMessageText: conversation.lastMessageText,
        lastMessageOrigin: conversation.lastMessageOrigin,
        lastMessageAt: conversation.lastMessageAt,

        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
    };
}

function ensureCompanyExists(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}