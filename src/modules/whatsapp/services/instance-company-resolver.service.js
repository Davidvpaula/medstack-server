import { AppError } from "../../../core/errors/AppError.js";

import {
    companyPostgresRepository
} from "../../../database/repositories/company.postgres.repository.js";

import {
    whatsappInstancePostgresRepository
} from "../../../database/repositories/whatsapp-instance.postgres.repository.js";

import {
    setInstanceCompanyBinding,
    getInstanceCompanyBindingFromStore,
    listInstanceCompanyBindingsFromStore
} from "../stores/instance-company-binding.store.js";

const instanceCompanyBindings = new Map();

export async function bindInstanceToCompany(
    instanceId,
    companyId
) {
    if (!instanceId) {
        throw new AppError("Informe instanceId.", 400);
    }

    if (!companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    const company =
        await companyPostgresRepository.findCompanyById(
            companyId
        );

    if (!company) {
        throw new AppError(
            "Empresa não encontrada.",
            404
        );
    }

    instanceCompanyBindings.set(
        instanceId,
        companyId
    );

    setInstanceCompanyBinding(
        instanceId,
        companyId
    );

    const existingInstance =
        await whatsappInstancePostgresRepository.findInstanceByKey(
            companyId,
            instanceId
        );

    if (!existingInstance) {
        await whatsappInstancePostgresRepository.createInstance({
            companyId,
            instanceKey: instanceId,
            provider: "baileys",
            status: "idle",
            sessionStatus: "disconnected",
            metadata: {
                boundAt: new Date().toISOString(),
                bindingSource: "instance-company-resolver"
            }
        });
    }

    return {
        instanceId,
        companyId,
        company
    };
}

export function getInstanceCompanyBinding(instanceId) {
    const memoryCompanyId =
        instanceCompanyBindings.get(instanceId);

    if (memoryCompanyId) {
        return {
            instanceId,
            companyId: memoryCompanyId
        };
    }

    const storedCompanyId =
        getInstanceCompanyBindingFromStore(instanceId);

    if (storedCompanyId) {
        instanceCompanyBindings.set(
            instanceId,
            storedCompanyId
        );
    }

    return {
        instanceId,
        companyId: storedCompanyId || null
    };
}

export function listInstanceCompanyBindings() {
    const storedBindings =
        listInstanceCompanyBindingsFromStore();

    for (const binding of storedBindings) {
        instanceCompanyBindings.set(
            binding.instanceId,
            binding.companyId
        );
    }

    return storedBindings;
}

export function resolveCompanyIdFromInstance(instanceId) {
    const boundCompanyId =
        instanceCompanyBindings.get(instanceId)
        || getInstanceCompanyBindingFromStore(instanceId);

    return boundCompanyId || null;
}

export async function resolveCompanyIdFromInstancePersistent(
    instanceId
) {
    if (!instanceId) {
        throw new AppError(
            "Informe instanceId.",
            400
        );
    }

    const localCompanyId =
        resolveCompanyIdFromInstance(instanceId);

    if (localCompanyId) {
        return localCompanyId;
    }

    const persistedInstance =
        await whatsappInstancePostgresRepository
            .findInstanceByKeyGlobal(instanceId);

    if (persistedInstance?.companyId) {
        cacheBinding(
            instanceId,
            persistedInstance.companyId
        );

        return persistedInstance.companyId;
    }

    const companies =
        await companyPostgresRepository.listCompanies({
            limit: 2,
            offset: 0
        });

    if (companies.length === 1) {
        cacheBinding(
            instanceId,
            companies[0].id
        );

        return companies[0].id;
    }

    throw new AppError(
        `Não foi possível resolver a empresa da instância "${instanceId}".`,
        404
    );
}

function cacheBinding(instanceId, companyId) {
    instanceCompanyBindings.set(
        instanceId,
        companyId
    );

    setInstanceCompanyBinding(
        instanceId,
        companyId
    );
}