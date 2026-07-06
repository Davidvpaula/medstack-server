import { AppError } from "../../../core/errors/AppError.js";

import { contactRepository } from "../../contact/repositories/contact.repository.js";
import { conversationRepository } from "../../conversation/repositories/conversation.repository.js";

import { handleOutgoingWhatsAppMessage } from "./whatsapp-message-handler.service.js";
import { syncProviderResult } from "./provider-sync.service.js";

import { getWhatsAppProvider } from "../providers/whatsapp-provider.factory.js";

import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

export async function sendWhatsAppText(data = {}) {
    const {
        companyId,
        conversationId,
        text,
        provider = "baileys",
        instanceId = WHATSAPP_DEFAULT_INSTANCE_ID,
        userId = null,
        metadata = {}
    } = data;

    if (!companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    if (!conversationId) {
        throw new AppError("Informe conversationId.", 400);
    }

    if (!text) {
        throw new AppError("Informe text.", 400);
    }

    const conversation = conversationRepository.findById(conversationId);

    if (!conversation) {
        throw new AppError("Conversa não encontrada.", 404);
    }

    if (conversation.companyId !== companyId) {
        throw new AppError("Conversa não pertence a esta empresa.", 403);
    }

    const contact = contactRepository.findById(conversation.contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    const whatsappProvider = getWhatsAppProvider(provider);

    const providerResult = await whatsappProvider.sendText({
        to: contact.phone,
        text,
        instanceId
    });

    const result = await handleOutgoingWhatsAppMessage({
        companyId,
        conversationId: conversation.id,
        contactId: contact.id,
        text,
        provider,
        userId,
        metadata: {
            ...metadata,
            instanceId,
            providerResult
        }
    });

    const syncedMessage = await syncProviderResult(
        result.message,
        providerResult
    );

    return {
        provider: providerResult,
        message: syncedMessage
    };
}