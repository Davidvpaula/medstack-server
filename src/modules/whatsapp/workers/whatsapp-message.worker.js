import { logger } from "../../../core/logger.js";

import {
    getNextWhatsappMessageJob,
    markJobProcessing,
    markJobCompleted,
    markJobFailed,
    isQueueProcessing,
    setQueueProcessing
} from "../queues/whatsapp-message.queue.js";

import {
    sendWhatsAppText
} from "../services/whatsapp-send.service.js";

import {
    addRuntimeLog
} from "../services/whatsapp-runtime-log.service.js";

let workerTimer = null;

const DEFAULT_INTERVAL_MS = 2000;

export function startWhatsappMessageWorker(intervalMs = DEFAULT_INTERVAL_MS) {
    if (workerTimer) {
        return {
            started: false,
            alreadyRunning: true
        };
    }

    workerTimer = setInterval(async () => {
        await processNextJob();
    }, intervalMs);

    logger.success("WhatsApp MessageWorker iniciado.");

    addRuntimeLog("success", "WhatsApp MessageWorker iniciado.", {
        intervalMs
    });

    return {
        started: true,
        intervalMs
    };
}

export function stopWhatsappMessageWorker() {
    if (!workerTimer) {
        return false;
    }

    clearInterval(workerTimer);
    workerTimer = null;

    logger.warn("WhatsApp MessageWorker parado.");

    addRuntimeLog("warn", "WhatsApp MessageWorker parado.");

    return true;
}

async function processNextJob() {
    if (isQueueProcessing()) {
        return;
    }

    const job = getNextWhatsappMessageJob();

    if (!job) {
        return;
    }

    setQueueProcessing(true);

    try {
        markJobProcessing(job);

        const result = await sendWhatsAppText(job.data);

        markJobCompleted(job, result);

        logger.success(`WhatsApp MessageWorker processou job: ${job.id}`);
    } catch (error) {
        markJobFailed(job, error);

        logger.error(`WhatsApp MessageWorker falhou job: ${job.id}`, error);
    } finally {
        setQueueProcessing(false);
    }
}