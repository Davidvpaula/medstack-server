import {
    syncWhatsappRuntime,
    markWhatsappRuntimeConnected,
    markWhatsappRuntimeDisconnected
} from "../../../database/runtime/runtime-sync.service.js";

import {
    resolveCompanyIdFromInstancePersistent
} from "./instance-company-resolver.service.js";

import {
    getWhatsappRuntime
} from "./whatsapp-runtime.service.js";

export async function persistWhatsappRuntime(
    instanceId
) {
    const companyId =
        await resolveCompanyIdFromInstancePersistent(
            instanceId
        );

    const runtime =
        getWhatsappRuntime(instanceId);

    return syncWhatsappRuntime({
        ...runtime,
        companyId,
        instanceId,
        instanceKey: instanceId,
        provider: "baileys"
    });
}

export async function persistWhatsappConnected(
    instanceId,
    data = {}
) {
    const companyId =
        await resolveCompanyIdFromInstancePersistent(
            instanceId
        );

    return markWhatsappRuntimeConnected({
        companyId,
        instanceKey: instanceId,
        provider: "baileys",
        phone: data.phone || null,
        displayName: data.displayName || null,
        metadata: {
            source: "whatsapp-runtime",
            ...(data.metadata || {})
        }
    });
}

export async function persistWhatsappDisconnected(
    instanceId,
    error = null
) {
    const companyId =
        await resolveCompanyIdFromInstancePersistent(
            instanceId
        );

    return markWhatsappRuntimeDisconnected({
        companyId,
        instanceKey: instanceId,
        provider: "baileys",
        error: normalizeError(error)
    });
}

export function persistWhatsappRuntimeSafely(
    instanceId
) {
    persistWhatsappRuntime(instanceId).catch((error) => {
        console.error(
            "[WhatsApp Persistence] Falha ao salvar runtime.",
            {
                instanceId,
                error: error.message
            }
        );
    });
}

export function persistWhatsappConnectedSafely(
    instanceId,
    data = {}
) {
    persistWhatsappConnected(
        instanceId,
        data
    ).catch((error) => {
        console.error(
            "[WhatsApp Persistence] Falha ao registrar conexão.",
            {
                instanceId,
                error: error.message
            }
        );
    });
}

export function persistWhatsappDisconnectedSafely(
    instanceId,
    error = null
) {
    persistWhatsappDisconnected(
        instanceId,
        error
    ).catch((persistenceError) => {
        console.error(
            "[WhatsApp Persistence] Falha ao registrar desconexão.",
            {
                instanceId,
                error: persistenceError.message
            }
        );
    });
}

function normalizeError(error) {
    if (!error) {
        return null;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}