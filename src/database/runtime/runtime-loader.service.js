import {
    whatsappInstancePostgresRepository
} from "../repositories/whatsapp-instance.postgres.repository.js";

export async function loadWhatsappRuntimeState(
    companyId,
    instanceKey = "main"
) {
    if (!companyId) {
        return null;
    }

    const instance =
        await whatsappInstancePostgresRepository.findInstanceByKey(
            companyId,
            instanceKey
        );

    if (!instance) {
        return null;
    }

    return {
        id: instance.id,
        companyId: instance.companyId,
        instanceKey: instance.instanceKey,
        provider: instance.provider,
        status: instance.status,
        sessionStatus: instance.sessionStatus,
        phone: instance.phone,
        displayName: instance.displayName,
        lastConnectedAt: instance.lastConnectedAt,
        lastDisconnectedAt: instance.lastDisconnectedAt,
        lastError: instance.lastError,
        runtimeMetadata:
            instance.metadata?.runtime || {},
        socketMetadata:
            instance.metadata?.socket || {},
        monitorMetadata:
            instance.metadata?.monitor || {},
        dispatcherMetadata:
            instance.metadata?.dispatcher || {},
        workerMetadata:
            instance.metadata?.worker || {},
        statistics:
            instance.metadata?.statistics || {},
        metadata:
            instance.metadata || {}
    };
}

export async function listCompanyWhatsappRuntimeStates(
    companyId,
    options = {}
) {
    if (!companyId) {
        return [];
    }

    const instances =
        await whatsappInstancePostgresRepository.listInstancesByCompany(
            companyId,
            options
        );

    return instances.map((instance) => ({
        id: instance.id,
        companyId: instance.companyId,
        instanceKey: instance.instanceKey,
        provider: instance.provider,
        status: instance.status,
        sessionStatus: instance.sessionStatus,
        phone: instance.phone,
        displayName: instance.displayName,
        lastConnectedAt: instance.lastConnectedAt,
        lastDisconnectedAt: instance.lastDisconnectedAt,
        lastError: instance.lastError,
        metadata: instance.metadata || {}
    }));
}