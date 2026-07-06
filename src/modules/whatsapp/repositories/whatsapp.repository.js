import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import {
    setWhatsappStatus,
    setWhatsappConnected,
    setWhatsappQr,
    setWhatsappStartedAt,
    setWhatsappLastDisconnectReason,
    setWhatsappLastError,
    incrementWhatsappReconnectAttempts,
    resetWhatsappReconnectAttempts,
    getWhatsappSnapshot,
    addWhatsappMessage,
    clearWhatsappMessages,
    getAllWhatsappStores,
    ensureWhatsappStore
} from "../stores/whatsapp.store.js";

export const whatsappRepository = {
    getInstance(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return ensureWhatsappStore(instanceId);
    },

    getSnapshot(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return getWhatsappSnapshot(instanceId);
    },

    getAllSnapshots() {
        return getAllWhatsappStores();
    },

    getStatusSnapshot(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const snapshot = getWhatsappSnapshot(instanceId);

        return {
            instanceId: snapshot.instanceId,
            status: snapshot.status,
            connected: snapshot.connected,
            hasQr: Boolean(snapshot.qr),
            messagesCount: snapshot.messages.length,

            startedAt: snapshot.startedAt,
            connectedAt: snapshot.connectedAt,
            disconnectedAt: snapshot.disconnectedAt,

            lastDisconnectReason: snapshot.lastDisconnectReason,
            lastError: snapshot.lastError,
            lastReconnectAt: snapshot.lastReconnectAt,

            reconnectAttempts: snapshot.reconnectAttempts,

            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
        };
    },

    getQrSnapshot(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const snapshot = getWhatsappSnapshot(instanceId);

        return {
            instanceId: snapshot.instanceId,
            qr: snapshot.qr,
            connected: snapshot.connected,
            status: snapshot.status
        };
    },

    isConnected(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return Boolean(getWhatsappSnapshot(instanceId).connected);
    },

    getStatus(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return getWhatsappSnapshot(instanceId).status;
    },

    getMessages(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return getWhatsappSnapshot(instanceId).messages;
    },

    setStatus(status, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappStatus(status, instanceId);
    },

    setConnected(connected, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappConnected(connected, instanceId);
    },

    setQr(qr, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappQr(qr, instanceId);
    },

    setStartedAt(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappStartedAt(instanceId);
    },

    setLastDisconnectReason(reason, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappLastDisconnectReason(reason, instanceId);
    },

    setLastError(error, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        setWhatsappLastError(error, instanceId);
    },

    incrementReconnectAttempts(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        incrementWhatsappReconnectAttempts(instanceId);
    },

    resetReconnectAttempts(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        resetWhatsappReconnectAttempts(instanceId);
    },

    saveIncomingMessage({ number, text }, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        addWhatsappMessage(
            {
                direction: "in",
                number,
                text
            },
            instanceId
        );
    },

    saveOutgoingMessage({ number, text }, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        addWhatsappMessage(
            {
                direction: "out",
                number,
                text
            },
            instanceId
        );
    },

    clearMessages(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        clearWhatsappMessages(instanceId);
    }
};