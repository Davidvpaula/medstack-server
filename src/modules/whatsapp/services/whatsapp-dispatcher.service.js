import { AppError } from "../../../core/errors/AppError.js";

import {
    addWhatsappMessageJob,
    listWhatsappMessageJobs,
    retryDeadLetterJob,
    clearWhatsappMessageQueue
} from "../queues/whatsapp-message.queue.js";

export function dispatchWhatsAppText(data = {}) {
    if (!data.companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    if (!data.conversationId) {
        throw new AppError("Informe conversationId.", 400);
    }

    if (!data.text) {
        throw new AppError("Informe text.", 400);
    }

    return addWhatsappMessageJob({
        ...data,
        type: "send_text"
    });
}

export function listWhatsAppDispatchQueue() {
    return listWhatsappMessageJobs();
}

export function retryWhatsAppDispatchJob(jobId) {
    if (!jobId) {
        throw new AppError("Informe jobId.", 400);
    }

    const job = retryDeadLetterJob(jobId);

    if (!job) {
        throw new AppError("Job não encontrado na Dead Letter Queue.", 404);
    }

    return job;
}

export function clearWhatsAppDispatchQueue() {
    return clearWhatsappMessageQueue();
}