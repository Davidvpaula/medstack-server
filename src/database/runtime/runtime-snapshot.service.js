function normalizeDate(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function normalizeError(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Error) {
        return value.message;
    }

    return String(value);
}

export function createRuntimeSnapshot(data = {}) {
    const runtimeStatus = data.status || {};
    const socketStatus = data.socket || {};
    const monitorStatus = data.monitor || {};
    const dispatcherStatus = data.dispatcher || {};
    const workerStatus = data.worker || {};
    const statistics = data.statistics || data.stats || {};

    return {
        instanceKey:
            data.instanceKey
            || data.instanceId
            || "main",

        companyId:
            data.companyId || null,

        provider:
            data.provider || "baileys",

        status:
            runtimeStatus.status
            || data.runtimeStatus
            || "idle",

        sessionStatus:
            runtimeStatus.connected
                ? "connected"
                : (
                    runtimeStatus.status
                    || data.sessionStatus
                    || "disconnected"
                ),

        phone:
            data.phone
            || runtimeStatus.phone
            || null,

        displayName:
            data.displayName
            || runtimeStatus.displayName
            || null,

        lastConnectedAt:
            normalizeDate(
                runtimeStatus.connectedAt
                || data.lastConnectedAt
            ),

        lastDisconnectedAt:
            normalizeDate(
                runtimeStatus.disconnectedAt
                || data.lastDisconnectedAt
            ),

        lastError:
            normalizeError(
                runtimeStatus.lastError
                || monitorStatus.lastError
                || data.lastError
            ),

        metadata: {
            runtime: {
                connected: Boolean(runtimeStatus.connected),
                hasQr: Boolean(runtimeStatus.hasQr),
                reconnectAttempt:
                    Number(runtimeStatus.reconnectAttempt || 0),
                statusCode:
                    runtimeStatus.statusCode || null
            },

            socket: {
                hasSocket: Boolean(socketStatus.hasSocket),
                alive: Boolean(socketStatus.alive),
                reconnectScheduled:
                    Boolean(socketStatus.reconnectScheduled)
            },

            monitor: {
                active: Boolean(monitorStatus.active),
                intervalMs:
                    Number(monitorStatus.intervalMs || 0),
                lastCheckAt:
                    normalizeDate(monitorStatus.lastCheckAt),
                lastRestartAt:
                    normalizeDate(monitorStatus.lastRestartAt)
            },

            dispatcher: {
                pending:
                    Number(dispatcherStatus.pending || 0),
                processing:
                    Number(dispatcherStatus.processing || 0),
                completed:
                    Number(dispatcherStatus.completed || 0),
                failed:
                    Number(dispatcherStatus.failed || 0)
            },

            worker: {
                running: Boolean(workerStatus.running),
                idle: Boolean(workerStatus.idle),
                processed:
                    Number(workerStatus.processed || 0),
                failed:
                    Number(workerStatus.failed || 0),
                lastJobId:
                    workerStatus.lastJobId || null
            },

            statistics: {
                inbound:
                    Number(statistics.inbound || 0),
                outbound:
                    Number(statistics.outbound || 0),
                delivered:
                    Number(statistics.delivered || 0),
                read:
                    Number(statistics.read || 0),
                failed:
                    Number(statistics.failed || 0)
            },

            snapshotAt:
                new Date().toISOString()
        }
    };
}