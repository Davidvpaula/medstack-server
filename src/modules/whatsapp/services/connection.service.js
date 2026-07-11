import QRCode from "qrcode";

import { Boom } from "@hapi/boom";

import {
    DisconnectReason
} from "@whiskeysockets/baileys";

import {
    WHATSAPP_DEFAULT_INSTANCE_ID
} from "../../../constants/index.js";

import {
    startWhatsappSocket,
    restartWhatsappSocket
} from "../sockets/whatsapp.socket.js";

import {
    removeWhatsappSession
} from "./session.service.js";

import {
    whatsappConnectionManager
} from "./connection-manager.service.js";

import {
    whatsappRepository
} from "../repositories/whatsapp.repository.js";

import {
    persistWhatsappRuntimeSafely,
    persistWhatsappConnectedSafely,
    persistWhatsappDisconnectedSafely
} from "./whatsapp-runtime-persistence.service.js";

export function getWhatsappStatus(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    return whatsappRepository.getStatusSnapshot(
        instanceId
    );
}

export async function startWhatsappConnection(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    if (whatsappRepository.isConnected(instanceId)) {
        persistWhatsappRuntimeSafely(instanceId);

        return whatsappRepository.getStatusSnapshot(
            instanceId
        );
    }

    await startWhatsappSocket(instanceId);

    persistWhatsappRuntimeSafely(instanceId);

    return whatsappRepository.getStatusSnapshot(
        instanceId
    );
}

export async function restartWhatsappConnection(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    await restartWhatsappSocket(instanceId);

    persistWhatsappRuntimeSafely(instanceId);

    return whatsappRepository.getStatusSnapshot(
        instanceId
    );
}

export async function handleWhatsappConnectionUpdate(
    update,
    reconnectCallback,
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const {
        connection,
        qr,
        lastDisconnect
    } = update;

    const statusCode = lastDisconnect?.error
        ? new Boom(lastDisconnect.error)
            ?.output
            ?.statusCode
        : null;

    console.log(
        "[WhatsApp connection.update]",
        {
            instanceId,
            connection,
            hasQr: Boolean(qr),
            statusCode,
            errorMessage:
                lastDisconnect?.error?.message
                || null
        }
    );

    if (qr) {
        const qrImage = await QRCode.toDataURL(qr);

        whatsappConnectionManager.markWaitingQr(
            qrImage,
            instanceId
        );

        persistWhatsappRuntimeSafely(instanceId);

        return;
    }

    if (connection === "open") {
        whatsappConnectionManager.markConnected(
            instanceId
        );

        persistWhatsappConnectedSafely(
            instanceId,
            extractConnectedIdentity(update)
        );

        return;
    }

    if (connection === "close") {
        const reason = getDisconnectReason(
            statusCode
        );

        const error =
            lastDisconnect?.error || null;

        persistWhatsappDisconnectedSafely(
            instanceId,
            error || reason
        );

        if (
            statusCode === DisconnectReason.loggedOut
            || statusCode === DisconnectReason.badSession
            || statusCode === 401
        ) {
            await removeWhatsappSession(instanceId);

            whatsappConnectionManager.markDisconnected(
                reason || "logged_out",
                error,
                instanceId
            );

            return;
        }

        whatsappConnectionManager.markReconnecting(
            reason,
            error,
            instanceId
        );

        whatsappConnectionManager.scheduleReconnect(
            async () => {
                await reconnectCallback(instanceId);
            },
            instanceId
        );
    }
}

function extractConnectedIdentity(update = {}) {
    const user =
        update.user
        || update.me
        || {};

    return {
        phone:
            normalizePhone(
                user.id
                || user.jid
                || ""
            ),

        displayName:
            user.name
            || user.verifiedName
            || user.notify
            || null,

        metadata: {
            connectionEventAt:
                new Date().toISOString()
        }
    };
}

function normalizePhone(value) {
    const phone = String(value || "")
        .split(":")[0]
        .split("@")[0]
        .replace(/\D/g, "");

    return phone || null;
}

function getDisconnectReason(statusCode) {
    const reasons = {
        [DisconnectReason.badSession]:
            "bad_session",

        [DisconnectReason.connectionClosed]:
            "connection_closed",

        [DisconnectReason.connectionLost]:
            "connection_lost",

        [DisconnectReason.connectionReplaced]:
            "connection_replaced",

        [DisconnectReason.loggedOut]:
            "logged_out",

        [DisconnectReason.restartRequired]:
            "restart_required",

        [DisconnectReason.timedOut]:
            "timed_out",

        401:
            "logged_out"
    };

    return reasons[statusCode] || "unknown";
}