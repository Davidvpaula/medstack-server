import { messageRepository } from "../../message/repositories/message.repository.js";

export async function syncProviderResult(message, providerResult) {
    if (!message) {
        return null;
    }

    message.metadata = {
        ...(message.metadata || {}),
        providerResult
    };

    if (!providerResult?.sent) {
        message.markFailed(
            providerResult?.reason || "Falha ao enviar pelo provider."
        );

        messageRepository.update(message.id, message);

        return message;
    }

    const externalId =
        providerResult.result?.key?.id ||
        providerResult.result?.id ||
        null;

    if (externalId) {
        message.externalId = externalId;
    }

    message.markSent();

    messageRepository.update(message.id, message);

    return message;
}