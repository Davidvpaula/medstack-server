import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";

import {
    setInstanceCompanyBinding,
    getInstanceCompanyBindingFromStore,
    listInstanceCompanyBindingsFromStore
} from "../stores/instance-company-binding.store.js";

const instanceCompanyBindings = new Map();

export function bindInstanceToCompany(instanceId, companyId) {
    if (!instanceId) {
        throw new AppError("Informe instanceId.", 400);
    }

    if (!companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    instanceCompanyBindings.set(instanceId, companyId);

    setInstanceCompanyBinding(instanceId, companyId);

    return {
        instanceId,
        companyId,
        company
    };
}

export function getInstanceCompanyBinding(instanceId) {
    const memoryCompanyId = instanceCompanyBindings.get(instanceId);

    if (memoryCompanyId) {
        return {
            instanceId,
            companyId: memoryCompanyId
        };
    }

    const storedCompanyId = getInstanceCompanyBindingFromStore(instanceId);

    return {
        instanceId,
        companyId: storedCompanyId
    };
}

export function listInstanceCompanyBindings() {
    const storedBindings = listInstanceCompanyBindingsFromStore();

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
        instanceCompanyBindings.get(instanceId) ||
        getInstanceCompanyBindingFromStore(instanceId);

    if (boundCompanyId) {
        return boundCompanyId;
    }

    const company = companyRepository.findById(instanceId);

    if (company) {
        return company.id;
    }

    const companies = companyRepository.list();

    if (companies.length === 1) {
        return companies[0].id;
    }

    return instanceId;
}