const logs = [];
const MAX_LOGS = 100;

export function addRuntimeLog(level, message, data = {}) {
    const log = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        level,
        message,
        data,
        createdAt: new Date().toISOString()
    };

    logs.unshift(log);

    if (logs.length > MAX_LOGS) {
        logs.pop();
    }

    return log;
}

export function getRuntimeLogs() {
    return logs;
}

export function getRecentRuntimeLogs(limit = 20) {
    return logs.slice(0, limit);
}

export function clearRuntimeLogs() {
    logs.length = 0;

    return {
        cleared: true
    };
}