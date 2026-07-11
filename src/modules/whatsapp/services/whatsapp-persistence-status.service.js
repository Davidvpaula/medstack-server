import {
    WHATSAPP_DEFAULT_INSTANCE_ID
} from "../../../constants/index.js";

import {
    getInstanceCompanyBinding
} from "./instance-company-resolver.service.js";

import {
    getWhatsappRuntimeFlusherState
} from "./whatsapp-runtime-flusher.service.js";

import {
    getPersistedWhatsappRuntime
} from "../../../database/runtime/runtime-sync.service.js";

export async function getWhatsappPersistenceStatus(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    const binding =
        getInstanceCompanyBinding(instanceId);

    const flusher =
        getWhatsappRuntimeFlusherState(
            instanceId
        );

    if (!binding.companyId) {
        return {
            module: "whatsapp-persistence",
            status: "unbound",
            instanceId,
            companyId: null,
            persisted: false,
            flusher,
            databaseInstance: null,
            generatedAt:
                new Date().toISOString()
        };
    }

    try {
        const databaseInstance =
            await getPersistedWhatsappRuntime(
                binding.companyId,
                instanceId
            );

        return {
            module: "whatsapp-persistence",
            status: "active",
            instanceId,
            companyId: binding.companyId,
            persisted: true,
            flusher,
            databaseInstance,
            generatedAt:
                new Date().toISOString()
        };
    } catch (error) {
        return {
            module: "whatsapp-persistence",
            status: "not_persisted",
            instanceId,
            companyId: binding.companyId,
            persisted: false,
            flusher,
            databaseInstance: null,
            error: error.message,
            generatedAt:
                new Date().toISOString()
        };
    }
}