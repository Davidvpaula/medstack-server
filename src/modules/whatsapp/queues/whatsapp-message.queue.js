import {
    incrementPending,
    decrementPending,
    incrementProcessing,
    decrementProcessing,
    incrementCompleted,
    incrementFailed,
    markWorkerRunning,
    markWorkerCompleted,
    markWorkerFailed,
    markWorkerIdle,
    resetDispatcherState,
    resetWorkerState
} from "../services/whatsapp-runtime-state.service.js";

import {
    addRuntimeLog
} from "../services/whatsapp-runtime-log.service.js";

const jobs = [];
const history = [];
const deadLetter = [];

let processing = false;

export function addWhatsappMessageJob(data = {}) {
    const job = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: data.type || "send_text",
        status: "pending",
        priority: data.priority || "normal",
        attempts: 0,
        maxAttempts: data.maxAttempts || 3,
        delayMs: data.delayMs || 2000,
        availableAt: new Date().toISOString(),
        data,
        result: null,
        error: null,
        errors: [],
        startedAt: null,
        finishedAt: null,
        durationMs: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    jobs.push(job);
    incrementPending();

    addRuntimeLog("info", "Job adicionado à fila.", {
        jobId: job.id,
        type: job.type,
        priority: job.priority,
        conversationId: data.conversationId || null
    });

    return job;
}

export function getNextWhatsappMessageJob() {
    const now = Date.now();

    return jobs
        .filter((job) => job.status === "pending")
        .filter((job) => new Date(job.availableAt).getTime() <= now)
        .sort(sortByPriorityAndDate)[0] || null;
}

export function markJobProcessing(job) {
    decrementPending();
    incrementProcessing();

    processing = true;

    job.status = "processing";
    job.attempts += 1;
    job.startedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();

    markWorkerRunning(job.id);

    addRuntimeLog("info", "Worker iniciou processamento do job.", {
        jobId: job.id,
        attempt: job.attempts
    });

    return job;
}

export function markJobCompleted(job, result = null) {
    decrementProcessing();
    incrementCompleted();

    processing = false;

    job.status = "completed";
    job.result = result;
    job.finishedAt = new Date().toISOString();
    job.durationMs = calculateDuration(job.startedAt, job.finishedAt);
    job.updatedAt = new Date().toISOString();

    history.push(job);

    markWorkerCompleted(job.id, job.durationMs);

    addRuntimeLog("success", "Job concluído com sucesso.", {
        jobId: job.id,
        durationMs: job.durationMs
    });

    return job;
}

export function markJobFailed(job, error) {
    const errorMessage = error?.message || String(error);

    job.error = errorMessage;
    job.errors.push({
        attempt: job.attempts,
        message: errorMessage,
        at: new Date().toISOString()
    });

    job.updatedAt = new Date().toISOString();

    if (job.attempts >= job.maxAttempts) {
        decrementProcessing();
        incrementFailed();

        processing = false;

        job.status = "failed";
        job.availableAt = null;
        job.finishedAt = new Date().toISOString();
        job.durationMs = calculateDuration(job.startedAt, job.finishedAt);

        history.push(job);
        deadLetter.push(job);

        markWorkerFailed(job.id, error, job.durationMs);

        addRuntimeLog("error", "Job enviado para Dead Letter Queue.", {
            jobId: job.id,
            error: errorMessage,
            attempts: job.attempts
        });

        return job;
    }

    decrementProcessing();
    incrementPending();

    processing = false;

    job.status = "pending";
    job.availableAt = new Date(Date.now() + calculateRetryDelay(job)).toISOString();

    markWorkerIdle();

    addRuntimeLog("warn", "Job falhou e será tentado novamente.", {
        jobId: job.id,
        error: errorMessage,
        nextAttemptAt: job.availableAt,
        attempts: job.attempts
    });

    return job;
}

export function retryDeadLetterJob(jobId) {
    const index = deadLetter.findIndex((job) => job.id === jobId);

    if (index === -1) {
        return null;
    }

    const job = deadLetter.splice(index, 1)[0];

    job.status = "pending";
    job.error = null;
    job.attempts = 0;
    job.availableAt = new Date().toISOString();
    job.startedAt = null;
    job.finishedAt = null;
    job.durationMs = null;
    job.updatedAt = new Date().toISOString();

    incrementPending();

    addRuntimeLog("info", "Job reenfileirado manualmente.", {
        jobId: job.id
    });

    return job;
}

export function clearWhatsappMessageQueue() {
    jobs.length = 0;
    history.length = 0;
    deadLetter.length = 0;
    processing = false;

    resetDispatcherState();
    resetWorkerState();

    addRuntimeLog("warn", "Fila WhatsApp limpa manualmente.");

    return {
        cleared: true
    };
}

export function isQueueProcessing() {
    return processing;
}

export function setQueueProcessing(value) {
    processing = Boolean(value);

    if (!processing) {
        markWorkerIdle();
    }
}

export function listWhatsappMessageJobs() {
    return {
        pending: jobs.filter((job) => job.status === "pending"),
        processing: jobs.filter((job) => job.status === "processing"),
        history,
        deadLetter
    };
}

function sortByPriorityAndDate(a, b) {
    const priorityWeight = {
        urgent: 1,
        high: 2,
        normal: 3,
        low: 4
    };

    const priorityA = priorityWeight[a.priority] || 3;
    const priorityB = priorityWeight[b.priority] || 3;

    if (priorityA !== priorityB) {
        return priorityA - priorityB;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function calculateRetryDelay(job) {
    return job.delayMs * job.attempts;
}

function calculateDuration(startedAt, finishedAt) {
    if (!startedAt || !finishedAt) {
        return null;
    }

    return new Date(finishedAt).getTime() - new Date(startedAt).getTime();
}