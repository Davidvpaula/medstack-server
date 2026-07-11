import {
    WHATSAPP_DEFAULT_INSTANCE_ID
} from "../../../constants/index.js";

import {
    persistWhatsappRuntime
} from "./whatsapp-runtime-persistence.service.js";

const flushers = new Map();

const DEFAULT_INTERVAL_MS = 30000;

export function startWhatsappRuntimeFlusher(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID,
    options = {}
) {
    const intervalMs = normalizeInterval(
        options.intervalMs
    );

    if (flushers.has(instanceId)) {
        return getWhatsappRuntimeFlusherState(
            instanceId
        );
    }

    const state = {
        instanceId,
        active: true,
        intervalMs,
        startedAt: new Date().toISOString(),
        stoppedAt: null,
        lastFlushAt: null,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastError: null,
        totalFlushes: 0,
        successfulFlushes: 0,
        failedFlushes: 0,
        timer: null
    };

    state.timer = setInterval(() => {
        flushWhatsappRuntime(instanceId).catch(
            (error) => {
                console.error(
                    "[WhatsApp Runtime Flusher] Erro inesperado.",
                    {
                        instanceId,
                        error: error.message
                    }
                );
            }
        );
    }, intervalMs);

    state.timer.unref?.();

    flushers.set(instanceId, state);

    flushWhatsappRuntime(instanceId).catch(
        (error) => {
            console.error(
                "[WhatsApp Runtime Flusher] Falha no primeiro snapshot.",
                {
                    instanceId,
                    error: error.message
                }
            );
        }
    );

    return sanitizeState(state);
}

export function stopWhatsappRuntimeFlusher(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const state = flushers.get(instanceId);

    if (!state) {
        return {
            instanceId,
            stopped: false,
            reason: "Flusher não estava ativo."
        };
    }

    if (state.timer) {
        clearInterval(state.timer);
    }

    state.active = false;
    state.stoppedAt = new Date().toISOString();
    state.timer = null;

    flushers.delete(instanceId);

    return {
        instanceId,
        stopped: true,
        stoppedAt: state.stoppedAt
    };
}

export async function flushWhatsappRuntime(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const state = flushers.get(instanceId);

    if (state) {
        state.totalFlushes += 1;
        state.lastFlushAt = new Date().toISOString();
    }

    try {
        const result = await persistWhatsappRuntime(
            instanceId
        );

        if (state) {
            state.successfulFlushes += 1;
            state.lastSuccessAt =
                new Date().toISOString();
            state.lastError = null;
        }

        return {
            flushed: true,
            instanceId,
            action: result.action,
            instance: result.instance,
            flushedAt: new Date().toISOString()
        };
    } catch (error) {
        if (state) {
            state.failedFlushes += 1;
            state.lastErrorAt =
                new Date().toISOString();
            state.lastError = error.message;
        }

        throw error;
    }
}

export function getWhatsappRuntimeFlusherState(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const state = flushers.get(instanceId);

    if (!state) {
        return {
            instanceId,
            active: false,
            intervalMs: null,
            startedAt: null,
            stoppedAt: null,
            lastFlushAt: null,
            lastSuccessAt: null,
            lastErrorAt: null,
            lastError: null,
            totalFlushes: 0,
            successfulFlushes: 0,
            failedFlushes: 0
        };
    }

    return sanitizeState(state);
}

export function listWhatsappRuntimeFlushers() {
    return Array.from(
        flushers.values()
    ).map(sanitizeState);
}

export function stopAllWhatsappRuntimeFlushers() {
    const results = [];

    for (const instanceId of flushers.keys()) {
        results.push(
            stopWhatsappRuntimeFlusher(instanceId)
        );
    }

    return results;
}

function sanitizeState(state) {
    const {
        timer,
        ...safeState
    } = state;

    return {
        ...safeState
    };
}

function normalizeInterval(value) {
    const interval = Number(
        value || DEFAULT_INTERVAL_MS
    );

    if (
        !Number.isFinite(interval)
        || interval < 5000
    ) {
        return DEFAULT_INTERVAL_MS;
    }

    return interval;
}