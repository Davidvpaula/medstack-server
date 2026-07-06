import { contactRepository } from "../../contact/repositories/contact.repository.js";

import { createContact } from "../../contact/services/contact.service.js";
import { createConversation } from "../../conversation/services/conversation.service.js";
import { createMessage } from "../../message/services/message.service.js";

import {
    MESSAGE_DIRECTION,
    MESSAGE_SENDER_TYPE,
    MESSAGE_TYPE
} from "../../message/constants/message.constants.js";

import {
    getStatsState
} from "./whatsapp-runtime-state.service.js";

export async function handleIncomingWhatsAppMessage(data = {}) {

    const {
        companyId,
        phone,
        name,
        text,
        externalId,
        provider = "baileys",
        metadata = {}
    } = data;

    if (!companyId) {
        throw new Error("Informe companyId.");
    }

    if (!phone) {
        throw new Error("Informe phone.");
    }

    const phoneNormalized =
        normalizePhone(phone);

    let contact =
        contactRepository.findByPhone(
            companyId,
            phoneNormalized
        );

    if (!contact) {

        contact =
            await createContact({

                companyId,

                name: name || phone,

                phone,

                source: provider,

                channel: "whatsapp",

                metadata: {

                    provider,

                    ...metadata

                }

            });

    }

    const conversation =
        await createConversation({

            companyId,

            contactId: contact.id,

            channel: "whatsapp",

            title: contact.name,

            metadata: {

                provider

            }

        });

    const message =
        await createMessage({

            companyId,

            conversationId: conversation.id,

            contactId: contact.id,

            direction: MESSAGE_DIRECTION.INBOUND,

            senderType: MESSAGE_SENDER_TYPE.CONTACT,

            senderId: contact.id,

            type: MESSAGE_TYPE.TEXT,

            text: text || "",

            externalId: externalId || null,

            metadata: {

                provider,

                phone,

                ...metadata

            }

        });

    getStatsState().inbound++;

    return {

        contact,

        conversation,

        message

    };

}

export async function handleOutgoingWhatsAppMessage(data = {}) {

    const {
        companyId,
        conversationId,
        contactId,
        text,
        provider = "baileys",
        userId = null,
        metadata = {}
    } = data;

    if (!companyId) {
        throw new Error("Informe companyId.");
    }

    if (!conversationId) {
        throw new Error("Informe conversationId.");
    }

    if (!contactId) {
        throw new Error("Informe contactId.");
    }

    const message =
        await createMessage({

            companyId,

            conversationId,

            contactId,

            direction: MESSAGE_DIRECTION.OUTBOUND,

            senderType:
                userId
                    ? MESSAGE_SENDER_TYPE.USER
                    : MESSAGE_SENDER_TYPE.SYSTEM,

            senderId: userId,

            type: MESSAGE_TYPE.TEXT,

            text: text || "",

            metadata: {

                provider,

                ...metadata

            }

        });

    getStatsState().outbound++;

    return {

        message

    };

}

function normalizePhone(phone) {

    return String(phone || "")
        .replace(/\D/g, "");

}