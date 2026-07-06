import { response } from "../../../core/response.js";

import {
    handleIncomingWhatsAppMessage,
    handleOutgoingWhatsAppMessage
} from "../services/whatsapp-message-handler.service.js";

export async function simulateIncoming(req, res, next) {
    try {
        const result = await handleIncomingWhatsAppMessage(req.body);

        return response.success(
            res,
            "Mensagem WhatsApp recebida simulada.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export async function simulateOutgoing(req, res, next) {
    try {
        const result = await handleOutgoingWhatsAppMessage(req.body);

        return response.success(
            res,
            "Mensagem WhatsApp enviada simulada.",
            result
        );
    } catch (error) {
        next(error);
    }
}