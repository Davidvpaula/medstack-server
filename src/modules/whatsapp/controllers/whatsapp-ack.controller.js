import { response } from "../../../core/response.js";

import {
    handleWhatsappMessageAck
} from "../services/whatsapp-message-ack.service.js";

export async function simulateAck(req, res, next) {
    try {
        const result = await handleWhatsappMessageAck(req.body);

        return response.success(
            res,
            "ACK simulado processado.",
            result
        );
    } catch (error) {
        next(error);
    }
}