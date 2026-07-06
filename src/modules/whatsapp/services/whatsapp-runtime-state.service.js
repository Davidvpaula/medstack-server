const runtimeState = {
    dispatcher: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
    },

    worker: {
        running: false,
        idle: true,
        processed: 0,
        failed: 0,
        lastJobId: null,
        lastJobStatus: null,
        lastDurationMs: null,
        lastExecution: null,
        lastError: null
    },

    stats: {
        inbound: 0,
        outbound: 0,
        delivered: 0,
        read: 0
    }
};

export function getRuntimeState() {
    return runtimeState;
}

export function getDispatcherState() {
    return runtimeState.dispatcher;
}

export function getWorkerState() {
    return runtimeState.worker;
}

export function getStatsState() {
    return runtimeState.stats;
}

export function incrementPending() {
    runtimeState.dispatcher.pending += 1;
}

export function decrementPending() {
    runtimeState.dispatcher.pending = Math.max(runtimeState.dispatcher.pending - 1, 0);
}

export function incrementProcessing() {
    runtimeState.dispatcher.processing += 1;
}

export function decrementProcessing() {
    runtimeState.dispatcher.processing = Math.max(runtimeState.dispatcher.processing - 1, 0);
}

export function incrementCompleted() {
    runtimeState.dispatcher.completed += 1;
}

export function incrementFailed() {
    runtimeState.dispatcher.failed += 1;
}

export function resetDispatcherState() {
    runtimeState.dispatcher.pending = 0;
    runtimeState.dispatcher.processing = 0;
    runtimeState.dispatcher.completed = 0;
    runtimeState.dispatcher.failed = 0;
}

export function markWorkerRunning(jobId = null) {
    runtimeState.worker.running = true;
    runtimeState.worker.idle = false;
    runtimeState.worker.lastJobId = jobId;
    runtimeState.worker.lastJobStatus = "processing";
    runtimeState.worker.lastError = null;
}

export function markWorkerIdle() {
    runtimeState.worker.running = false;
    runtimeState.worker.idle = true;
}

export function markWorkerCompleted(jobId, durationMs = null) {
    runtimeState.worker.processed += 1;
    runtimeState.worker.running = false;
    runtimeState.worker.idle = true;
    runtimeState.worker.lastJobId = jobId;
    runtimeState.worker.lastJobStatus = "completed";
    runtimeState.worker.lastDurationMs = durationMs;
    runtimeState.worker.lastExecution = new Date().toISOString();
    runtimeState.worker.lastError = null;
}

export function markWorkerFailed(jobId, error, durationMs = null) {
    runtimeState.worker.failed += 1;
    runtimeState.worker.running = false;
    runtimeState.worker.idle = true;
    runtimeState.worker.lastJobId = jobId;
    runtimeState.worker.lastJobStatus = "failed";
    runtimeState.worker.lastDurationMs = durationMs;
    runtimeState.worker.lastExecution = new Date().toISOString();
    runtimeState.worker.lastError = error?.message || String(error);
}

export function resetWorkerState() {
    runtimeState.worker.running = false;
    runtimeState.worker.idle = true;
    runtimeState.worker.processed = 0;
    runtimeState.worker.failed = 0;
    runtimeState.worker.lastJobId = null;
    runtimeState.worker.lastJobStatus = null;
    runtimeState.worker.lastDurationMs = null;
    runtimeState.worker.lastExecution = null;
    runtimeState.worker.lastError = null;
}