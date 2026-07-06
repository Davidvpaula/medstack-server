import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";
import { processIncomingWhatsappMessage } from "../services/message.service.js";

export async function handleMessagesUpsert(
    { messages },
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const message = messages?.[0];

    if (!message?.message || message.key?.fromMe) {
        return;
    }

    await processIncomingWhatsappMessage(message, instanceId);
}