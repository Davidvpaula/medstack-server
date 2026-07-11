import { response } from "../../../core/response.js";

import {
    getMessageStatus,
    listMessages,
    listMessagesByCompany,
    listMessagesByConversation,
    listMessagesByContact,
    getMessageById,
    createMessage,
    updateMessage,
    deleteMessage,
    markMessageSent,
    markMessageDelivered,
    markMessageRead,
    markMessageFailed
} from "../services/message.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do Message carregado.",
        getMessageStatus()
    );
}

export async function list(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagens carregadas.",
            await listMessages()
        );
    } catch (error) {
        next(error);
    }
}

export async function listByCompany(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagens da empresa carregadas.",
            await listMessagesByCompany(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export async function listByConversation(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagens da conversa carregadas.",
            await listMessagesByConversation(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function listByContact(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagens do contato carregadas.",
            await listMessagesByContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function show(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem carregada.",
            await getMessageById(req.params.messageId)
        );
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const message = await createMessage(req.body);

        return response.success(
            res,
            "Mensagem criada.",
            message
        );
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const message = await updateMessage(
            req.params.messageId,
            req.body
        );

        return response.success(
            res,
            "Mensagem atualizada.",
            message
        );
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        const result = await deleteMessage(req.params.messageId);

        return response.success(
            res,
            "Mensagem removida.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export async function sent(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem marcada como enviada.",
            await markMessageSent(req.params.messageId)
        );
    } catch (error) {
        next(error);
    }
}

export async function delivered(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem marcada como entregue.",
            await markMessageDelivered(req.params.messageId)
        );
    } catch (error) {
        next(error);
    }
}

export async function read(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem marcada como lida.",
            await markMessageRead(req.params.messageId)
        );
    } catch (error) {
        next(error);
    }
}

export async function failed(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem marcada como falha.",
            await markMessageFailed(
                req.params.messageId,
                req.body.error
            )
        );
    } catch (error) {
        next(error);
    }
}