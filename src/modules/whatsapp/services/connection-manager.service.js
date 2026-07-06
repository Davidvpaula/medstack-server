import { logger } from "../../../core/logger.js";
import { WHATSAPP_DEFAULT_INSTANCE_ID, WHATSAPP_STATUS } from "../../../constants/index.js";

import { whatsappRepository } from "../repositories/whatsapp.repository.js";
import { whatsappSocketLifecycle } from "./socket-lifecycle.service.js";

class WhatsappConnectionManager {
    constructor() {
        this.runtimes = new Map();
        this.defaultReconnectDelayMs = 3000;
    }

    ensureRuntime(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        if (!this.runtimes.has(instanceId)) {
            this.runtimes.set(instanceId, {
                starting: false,
                reconnectTimer: null,
                reconnectDelayMs: this.defaultReconnectDelayMs,
                health: {
                    lastHeartbeatAt: null,
                    lastSocketCheckAt: null,
                    lastManualRestartAt: null,
                    lastReconnectScheduledAt: null
                }
            });
        }

        return this.runtimes.get(instanceId);
    }

    getSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return whatsappSocketLifecycle.getSocket(instanceId);
    }

    hasSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return whatsappSocketLifecycle.hasSocket(instanceId);
    }

    isStarting(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return this.ensureRuntime(instanceId).starting;
    }

    getHealth(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        return {
            instanceId,
            starting: runtime.starting,
            hasSocket: whatsappSocketLifecycle.hasSocket(instanceId),
            socketAlive: whatsappSocketLifecycle.isSocketAlive(instanceId),
            reconnectScheduled: Boolean(runtime.reconnectTimer),
            reconnectDelayMs: runtime.reconnectDelayMs,
            ...runtime.health
        };
    }

    markStarting(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = true;

        whatsappRepository.setStartedAt(instanceId);
        whatsappRepository.setStatus(WHATSAPP_STATUS.STARTING, instanceId);
        whatsappRepository.setConnected(false, instanceId);
        whatsappRepository.setLastError(null, instanceId);

        logger.info(`WhatsApp iniciando conexão. Instância: ${instanceId}`);
    }

    markWaitingQr(qr, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;

        whatsappRepository.setQr(qr, instanceId);
        whatsappRepository.setStatus(WHATSAPP_STATUS.WAITING_QR, instanceId);
        whatsappRepository.setConnected(false, instanceId);

        logger.info(`WhatsApp aguardando QR Code. Instância: ${instanceId}`);
    }

    markConnected(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;

        whatsappRepository.setQr(null, instanceId);
        whatsappRepository.setStatus(WHATSAPP_STATUS.CONNECTED, instanceId);
        whatsappRepository.setConnected(true, instanceId);
        whatsappRepository.setLastDisconnectReason(null, instanceId);
        whatsappRepository.setLastError(null, instanceId);
        whatsappRepository.resetReconnectAttempts(instanceId);

        this.clearReconnectTimer(instanceId);

        logger.success(`WhatsApp conectado. Instância: ${instanceId}`);
    }

    markDisconnected(reason = null, error = null, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;

        whatsappSocketLifecycle.resetSocket(instanceId);

        whatsappRepository.setStatus(WHATSAPP_STATUS.DISCONNECTED, instanceId);
        whatsappRepository.setConnected(false, instanceId);
        whatsappRepository.setLastDisconnectReason(reason, instanceId);
        whatsappRepository.setLastError(error, instanceId);

        logger.warn(`WhatsApp desconectado. Instância: ${instanceId}${reason ? ` Motivo: ${reason}` : ""}`);
    }

    markReconnecting(reason = null, error = null, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;

        whatsappSocketLifecycle.resetSocket(instanceId);

        whatsappRepository.incrementReconnectAttempts(instanceId);
        whatsappRepository.setStatus(WHATSAPP_STATUS.RECONNECTING, instanceId);
        whatsappRepository.setConnected(false, instanceId);
        whatsappRepository.setLastDisconnectReason(reason, instanceId);
        whatsappRepository.setLastError(error, instanceId);

        logger.warn(`WhatsApp reconectando. Instância: ${instanceId}${reason ? ` Motivo: ${reason}` : ""}`);
    }

    markRestarting(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;
        runtime.health.lastManualRestartAt = new Date().toISOString();

        whatsappRepository.setQr(null, instanceId);
        whatsappRepository.setStatus(WHATSAPP_STATUS.RESTARTING, instanceId);
        whatsappRepository.setConnected(false, instanceId);
        whatsappRepository.setLastError(null, instanceId);

        logger.warn(`WhatsApp reiniciando. Instância: ${instanceId}`);
    }

    markHeartbeat(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.health.lastHeartbeatAt = new Date().toISOString();
    }

    markSocketCheck(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.health.lastSocketCheckAt = new Date().toISOString();
    }

    markError(error, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        runtime.starting = false;

        whatsappRepository.setStatus(WHATSAPP_STATUS.ERROR, instanceId);
        whatsappRepository.setConnected(false, instanceId);
        whatsappRepository.setLastError(error, instanceId);

        logger.error(`Erro no módulo WhatsApp. Instância: ${instanceId}`, error);
    }

    shouldSkipStart(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        if (whatsappRepository.isConnected(instanceId)) {
            return true;
        }

        if (runtime.starting) {
            return true;
        }

        if (
            whatsappRepository.getStatus(instanceId) === WHATSAPP_STATUS.WAITING_QR &&
            whatsappSocketLifecycle.hasSocket(instanceId)
        ) {
            return true;
        }

        if (
            whatsappRepository.getStatus(instanceId) === WHATSAPP_STATUS.RECONNECTING &&
            whatsappSocketLifecycle.hasSocket(instanceId)
        ) {
            return true;
        }

        return false;
    }

    scheduleReconnect(callback, instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        this.clearReconnectTimer(instanceId);

        runtime.health.lastReconnectScheduledAt = new Date().toISOString();

        runtime.reconnectTimer = setTimeout(async () => {
            runtime.reconnectTimer = null;

            try {
                await callback(instanceId);
            } catch (error) {
                this.markError(error, instanceId);
            }
        }, runtime.reconnectDelayMs);
    }

    clearReconnectTimer(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        if (runtime.reconnectTimer) {
            clearTimeout(runtime.reconnectTimer);
            runtime.reconnectTimer = null;
        }
    }

    resetRuntime(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const runtime = this.ensureRuntime(instanceId);

        this.clearReconnectTimer(instanceId);
        whatsappSocketLifecycle.resetSocket(instanceId);

        runtime.starting = false;
    }
}

export const whatsappConnectionManager = new WhatsappConnectionManager();