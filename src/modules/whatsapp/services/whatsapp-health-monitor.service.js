import { logger } from "../../../core/logger.js";

import {
    listInstanceCompanyBindings
} from "./instance-company-resolver.service.js";

import {
    getWhatsappRuntime
} from "./whatsapp-runtime.service.js";

import {
    restartWhatsappRuntime
} from "./whatsapp-runtime-action.service.js";

import {
    whatsappConnectionManager
} from "./connection-manager.service.js";

const monitors = new Map();
const monitorState = new Map();

const DEFAULT_INTERVAL_MS = 30000;

export function startWhatsappHealthMonitor(intervalMs = DEFAULT_INTERVAL_MS) {
    const bindings = listInstanceCompanyBindings();

    if (!bindings.length) {
        logger.info("WhatsApp HealthMonitor: nenhuma instância vinculada.");
        return [];
    }

    const started = [];

    for (const binding of bindings) {
        const instanceId = binding.instanceId;

        if (monitors.has(instanceId)) {
            started.push({
                instanceId,
                alreadyRunning: true,
                intervalMs
            });

            continue;
        }

        monitorState.set(instanceId, {
            active: true,
            intervalMs,
            lastCheckAt: null,
            lastRestartAt: null,
            lastStatus: null,
            lastError: null
        });

        const timer = setInterval(async () => {
            await checkWhatsappRuntime(instanceId);
        }, intervalMs);

        monitors.set(instanceId, timer);

        started.push({
            instanceId,
            started: true,
            intervalMs
        });

        logger.success(`WhatsApp HealthMonitor iniciado. Instância: ${instanceId}`);
    }

    return started;
}

export function stopWhatsappHealthMonitor(instanceId) {
    const timer = monitors.get(instanceId);

    if (!timer) {
        return false;
    }

    clearInterval(timer);
    monitors.delete(instanceId);

    const state = getWhatsappHealthMonitorState(instanceId);

    monitorState.set(instanceId, {
        ...state,
        active: false
    });

    logger.warn(`WhatsApp HealthMonitor parado. Instância: ${instanceId}`);

    return true;
}

export function getWhatsappHealthMonitorState(instanceId) {
    return monitorState.get(instanceId) || {
        active: false,
        intervalMs: null,
        lastCheckAt: null,
        lastRestartAt: null,
        lastStatus: null,
        lastError: null
    };
}

export function listWhatsappHealthMonitors() {
    return Array.from(monitorState.entries()).map(
        ([instanceId, state]) => ({
            instanceId,
            ...state
        })
    );
}

async function checkWhatsappRuntime(instanceId) {
    const runtime = getWhatsappRuntime(instanceId);

    const status = runtime.status?.status;
    const connected = Boolean(runtime.status?.connected);
    const hasSocket = Boolean(runtime.socket?.hasSocket);
    const socketAlive = Boolean(runtime.socket?.alive);

    const state = getWhatsappHealthMonitorState(instanceId);

    monitorState.set(instanceId, {
        ...state,
        lastCheckAt: new Date().toISOString(),
        lastStatus: status,
        lastError: null
    });

    whatsappConnectionManager.markSocketCheck(instanceId);

    if (status === "starting" || status === "waiting_qr" || status === "reconnecting") {
        return;
    }

    if (connected && hasSocket && socketAlive) {
        return;
    }

    logger.warn(`WhatsApp HealthMonitor detectou runtime instável. Instância: ${instanceId}`);

    try {
        await restartWhatsappRuntime(instanceId);

        const currentState = getWhatsappHealthMonitorState(instanceId);

        monitorState.set(instanceId, {
            ...currentState,
            lastRestartAt: new Date().toISOString(),
            lastError: null
        });

        logger.success(`WhatsApp HealthMonitor reconectou instância: ${instanceId}`);
    } catch (error) {
        const currentState = getWhatsappHealthMonitorState(instanceId);

        monitorState.set(instanceId, {
            ...currentState,
            lastError: error.message
        });

        logger.error(`WhatsApp HealthMonitor falhou ao reconectar instância: ${instanceId}`, error);
    }
}