import { response } from "../../../core/response.js";

import {
    getConversationStatus,
    listConversations,
    listConversationsByCompany,
    listConversationsByContact,
    getConversationById,
    createConversation,
    updateConversation,
    assignConversation,
    closeConversation,
    reopenConversation,
    archiveConversation,
    deleteConversation,
    markConversationInbound,
    markConversationOutbound,
    setConversationTyping,
    enableConversationAI,
    disableConversationAI,
    enableConversationFlow,
    disableConversationFlow,
    readConversationMessages
} from "../services/conversation.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do Conversation carregado.",
        getConversationStatus()
    );
}

export function list(req, res) {
    return response.success(
        res,
        "Conversas carregadas.",
        listConversations()
    );
}

export function listByCompany(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas da empresa carregadas.",
            listConversationsByCompany(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function listByContact(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas do contato carregadas.",
            listConversationsByContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export function show(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa carregada.",
            getConversationById(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const conversation = await createConversation(req.body);

        return response.success(
            res,
            "Conversa criada.",
            conversation
        );
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const conversation = await updateConversation(
            req.params.conversationId,
            req.body
        );

        return response.success(
            res,
            "Conversa atualizada.",
            conversation
        );
    } catch (error) {
        next(error);
    }
}

export async function assign(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa atribuída.",
            await assignConversation(
                req.params.conversationId,
                req.body.userId
            )
        );
    } catch (error) {
        next(error);
    }
}

export async function close(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa encerrada.",
            await closeConversation(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function reopen(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa reaberta.",
            await reopenConversation(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function archive(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa arquivada.",
            await archiveConversation(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        return response.success(
            res,
            "Conversa removida.",
            await deleteConversation(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function inbound(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem inbound registrada na conversa.",
            await markConversationInbound(
                req.params.conversationId,
                req.body
            )
        );
    } catch (error) {
        next(error);
    }
}

export async function outbound(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagem outbound registrada na conversa.",
            await markConversationOutbound(
                req.params.conversationId,
                req.body
            )
        );
    } catch (error) {
        next(error);
    }
}

export async function typing(req, res, next) {
    try {
        return response.success(
            res,
            "Typing da conversa atualizado.",
            await setConversationTyping(
                req.params.conversationId,
                req.body.typing
            )
        );
    } catch (error) {
        next(error);
    }
}

export async function enableAI(req, res, next) {
    try {
        return response.success(
            res,
            "IA ativada na conversa.",
            await enableConversationAI(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function disableAI(req, res, next) {
    try {
        return response.success(
            res,
            "IA desativada na conversa.",
            await disableConversationAI(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function enableFlow(req, res, next) {
    try {
        return response.success(
            res,
            "Fluxo ativado na conversa.",
            await enableConversationFlow(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function disableFlow(req, res, next) {
    try {
        return response.success(
            res,
            "Fluxo desativado na conversa.",
            await disableConversationFlow(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}

export async function read(req, res, next) {
    try {
        return response.success(
            res,
            "Mensagens da conversa marcadas como lidas.",
            await readConversationMessages(req.params.conversationId)
        );
    } catch (error) {
        next(error);
    }
}