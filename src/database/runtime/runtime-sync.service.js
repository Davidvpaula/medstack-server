import { AppError } from "../../core/errors/AppError.js";

import {
    whatsappInstancePostgresRepository
} from "../repositories/whatsapp-instance.postgres.repository.js";

import {
    createRuntimeSnapshot
} from "./runtime-snapshot.service.js";

export async function syncWhatsappRuntime(data = {}) {
    if (!data.companyId) {
        throw new AppError(
            "companyId é obrigatório para sincronizar o runtime.",
            400
        );
    }

    const snapshot = createRuntimeSnapshot(data);

    let instance =
        await whatsappInstancePostgresRepository.findInstanceByKey(
            snapshot.companyId,
            snapshot.instanceKey
        );

    if (!instance) {
        instance =
            await whatsappInstancePostgresRepository.createInstance({
                companyId: snapshot.companyId,
                instanceKey: snapshot.instanceKey,
                provider: snapshot.provider,
                status: snapshot.status,
                sessionStatus: snapshot.sessionStatus,
                phone: snapshot.phone,
                displayName: snapshot.displayName,
                lastConnectedAt: snapshot.lastConnectedAt,
                lastDisconnectedAt: snapshot.lastDisconnectedAt,
                lastError: snapshot.lastError,
                metadata: snapshot.metadata
            });

        return {
            action: "created",
            instance,
            snapshot
        };
    }

    const mergedMetadata = {
        ...(instance.metadata || {}),
        ...(snapshot.metadata || {})
    };

    const updatedInstance =
        await whatsappInstancePostgresRepository.updateInstance(
            snapshot.companyId,
            instance.id,
            {
                provider: snapshot.provider,
                status: snapshot.status,
                sessionStatus: snapshot.sessionStatus,
                phone: snapshot.phone,
                displayName: snapshot.displayName,
                lastConnectedAt: snapshot.lastConnectedAt,
                lastDisconnectedAt: snapshot.lastDisconnectedAt,
                lastError: snapshot.lastError,
                metadata: mergedMetadata
            }
        );

    return {
        action: "updated",
        instance: updatedInstance,
        snapshot
    };
}

export async function markWhatsappRuntimeConnected(data = {}) {
    if (!data.companyId) {
        throw new AppError("companyId é obrigatório.", 400);
    }

    if (!data.instanceKey) {
        throw new AppError("instanceKey é obrigatório.", 400);
    }

    const instance =
        await findOrCreateInstance(
            data.companyId,
            data.instanceKey,
            data.provider
        );

    const updatedInstance =
        await whatsappInstancePostgresRepository.markConnected(
            data.companyId,
            instance.id,
            {
                phone: data.phone || null,
                displayName: data.displayName || null,
                metadata: {
                    ...(instance.metadata || {}),
                    ...(data.metadata || {}),
                    connectedAt: new Date().toISOString()
                }
            }
        );

    return {
        action: "connected",
        instance: updatedInstance
    };
}

export async function markWhatsappRuntimeDisconnected(data = {}) {
    if (!data.companyId) {
        throw new AppError("companyId é obrigatório.", 400);
    }

    if (!data.instanceKey) {
        throw new AppError("instanceKey é obrigatório.", 400);
    }

    const instance =
        await findOrCreateInstance(
            data.companyId,
            data.instanceKey,
            data.provider
        );

    const updatedInstance =
        await whatsappInstancePostgresRepository.markDisconnected(
            data.companyId,
            instance.id,
            data.error || null
        );

    return {
        action: "disconnected",
        instance: updatedInstance
    };
}

export async function getPersistedWhatsappRuntime(
    companyId,
    instanceKey = "main"
) {
    if (!companyId) {
        throw new AppError("companyId é obrigatório.", 400);
    }

    const instance =
        await whatsappInstancePostgresRepository.findInstanceByKey(
            companyId,
            instanceKey
        );

    if (!instance) {
        throw new AppError(
            "Instância WhatsApp não encontrada.",
            404
        );
    }

    return instance;
}

async function findOrCreateInstance(
    companyId,
    instanceKey,
    provider = "baileys"
) {
    const existing =
        await whatsappInstancePostgresRepository.findInstanceByKey(
            companyId,
            instanceKey
        );

    if (existing) {
        return existing;
    }

    return whatsappInstancePostgresRepository.createInstance({
        companyId,
        instanceKey,
        provider,
        status: "idle",
        sessionStatus: "disconnected",
        metadata: {
            createdByRuntimeSync: true
        }
    });
}