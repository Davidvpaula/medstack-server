import { AppError } from "../../../core/errors/AppError.js";
import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import { sendWhatsappSocketMessage } from "../sockets/whatsapp.socket.js";
import { whatsappRepository } from "../repositories/whatsapp.repository.js";

export function listWhatsappMessages(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return whatsappRepository.getMessages(instanceId);
}

export async function sendWhatsappMessage(
    { number, text },
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    if (!number || !text) {
        throw new AppError("Informe number e text.", 400);
    }

    if (!whatsappRepository.isConnected(instanceId)) {
        throw new AppError("WhatsApp não conectado.", 400);
    }

    await sendWhatsappSocketMessage(number, text, instanceId);

    return {
        instanceId,
        number,
        text
    };
}

export async function processIncomingWhatsappMessage(
    message,
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const number = message.key.remoteJid;
    const text = extractWhatsappMessageText(message);

    whatsappRepository.saveIncomingMessage(
        {
            number,
            text
        },
        instanceId
    );

    return {
        instanceId,
        direction: "in",
        number,
        text
    };
}

export async function processOutgoingWhatsappMessage(
    number,
    text,
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    whatsappRepository.saveOutgoingMessage(
        {
            number,
            text
        },
        instanceId
    );

    return {
        instanceId,
        direction: "out",
        number,
        text
    };
}

function extractWhatsappMessageText(message) {
    return (
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        "[mensagem não textual]"
    );
}