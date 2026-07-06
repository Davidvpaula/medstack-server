import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";
import { whatsappInstanceManager } from "../services/instance-manager.service.js";

export function ensureWhatsappStore(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return whatsappInstanceManager.getInstance(instanceId);
}

export const whatsappStore = ensureWhatsappStore();

export function setWhatsappStatus(status, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.status = status;
    instance.touch();
}

export function setWhatsappConnected(connected, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.connected = Boolean(connected);

    if (connected) {
        instance.connectedAt = new Date().toISOString();
        instance.disconnectedAt = null;
    } else {
        instance.disconnectedAt = new Date().toISOString();
    }

    instance.touch();
}

export function setWhatsappQr(qr, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.qr = qr;
    instance.touch();
}

export function setWhatsappStartedAt(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.startedAt = new Date().toISOString();
    instance.touch();
}

export function setWhatsappLastDisconnectReason(reason, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.lastDisconnectReason = reason || null;
    instance.touch();
}

export function setWhatsappLastError(error, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.lastError = error
        ? {
              message: error.message || String(error),
              name: error.name || null,
              createdAt: new Date().toISOString()
          }
        : null;

    instance.touch();
}

export function incrementWhatsappReconnectAttempts(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.reconnectAttempts += 1;
    instance.lastReconnectAt = new Date().toISOString();
    instance.touch();
}

export function resetWhatsappReconnectAttempts(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.reconnectAttempts = 0;
    instance.lastReconnectAt = null;
    instance.touch();
}

export function getWhatsappSnapshot(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    return {
        instanceId: instance.id,
        status: instance.status,
        connected: instance.connected,
        qr: instance.qr,
        messages: instance.messages,

        startedAt: instance.startedAt,
        connectedAt: instance.connectedAt,
        disconnectedAt: instance.disconnectedAt,

        lastDisconnectReason: instance.lastDisconnectReason,
        lastError: instance.lastError,
        lastReconnectAt: instance.lastReconnectAt,

        reconnectAttempts: instance.reconnectAttempts,

        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,

        metadata: instance.metadata,
        runtime: instance.runtime,
        health: instance.health,
        statistics: instance.statistics,
        configuration: instance.configuration
    };
}

export function addWhatsappMessage(message, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.messages.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...message,
        createdAt: new Date().toISOString()
    });

    instance.messages = instance.messages.slice(0, 100);
    instance.touch();
}

export function clearWhatsappMessages(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const instance = ensureWhatsappStore(instanceId);

    instance.messages = [];
    instance.touch();
}

export function resetWhatsappStore(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return whatsappInstanceManager.resetInstance(instanceId);
}

export function getAllWhatsappStores() {
    return whatsappInstanceManager.getAllInstances().map((instance) => ({
        instanceId: instance.id,
        status: instance.status,
        connected: instance.connected,
        qr: instance.qr,
        messages: instance.messages,

        startedAt: instance.startedAt,
        connectedAt: instance.connectedAt,
        disconnectedAt: instance.disconnectedAt,

        lastDisconnectReason: instance.lastDisconnectReason,
        lastError: instance.lastError,
        lastReconnectAt: instance.lastReconnectAt,

        reconnectAttempts: instance.reconnectAttempts,

        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,

        metadata: instance.metadata,
        runtime: instance.runtime,
        health: instance.health,
        statistics: instance.statistics,
        configuration: instance.configuration
    }));
}