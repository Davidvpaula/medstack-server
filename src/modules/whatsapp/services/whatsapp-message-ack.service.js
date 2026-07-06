import { messageRepository } from "../../message/repositories/message.repository.js";

import {
    getStatsState,
    incrementCompleted
} from "./whatsapp-runtime-state.service.js";

export async function handleWhatsappMessageAck(event = {}) {

    const updates =
        Array.isArray(event)
            ? event
            : [event];

    const results = [];

    for (const item of updates) {

        const result =
            await processAckItem(item);

        if (result) {
            results.push(result);
        }

    }

    return results;

}

async function processAckItem(item = {}) {

    const externalId =
        item.key?.id
        || item.externalId
        || null;

    if (!externalId) {
        return null;
    }

    const message =
        findMessageByExternalId(externalId);

    if (!message) {
        return null;
    }

    const ackStatus =
        item.update?.status
        ?? item.status
        ?? null;

    if (ackStatus === null || ackStatus === undefined) {
        return null;
    }

    applyAckStatus(
        message,
        ackStatus
    );

    message.metadata = {

        ...(message.metadata || {}),

        whatsappAck: {

            status: ackStatus,

            externalId,

            raw: item.update || item

        }

    };

    messageRepository.update(
        message.id,
        message
    );

    return message;

}

function applyAckStatus(
    message,
    ackStatus
) {

    const runtime =
        getStatsState();

    const normalizedStatus =
        normalizeAckStatus(ackStatus);

    if (normalizedStatus === "read") {

        message.markRead();

        runtime.read++;

        incrementCompleted();

        return;

    }

    if (normalizedStatus === "delivered") {

        message.markDelivered();

        runtime.delivered++;

        return;

    }

    if (normalizedStatus === "sent") {

        message.markSent();

    }

}

function normalizeAckStatus(status) {

    if (status === 5) {
        return "read";
    }

    if (status === 4) {
        return "read";
    }

    if (status === 3) {
        return "delivered";
    }

    if (status === 2) {
        return "sent";
    }

    if (String(status).toLowerCase() === "read") {
        return "read";
    }

    if (String(status).toLowerCase() === "delivered") {
        return "delivered";
    }

    if (String(status).toLowerCase() === "sent") {
        return "sent";
    }

    return "unknown";

}

function findMessageByExternalId(externalId) {

    return messageRepository
        .list()
        .find(
            message =>
                String(message.externalId)
                === String(externalId)
        );

}