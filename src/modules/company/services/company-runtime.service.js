import { AppError } from "../../../core/errors/AppError.js";
import { companyRepository } from "../repositories/company.repository.js";

export function getCompanyRuntime(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return {
        companyId: company.id,
        runtime: company.runtime,
        health: company.health,
        statistics: company.statistics,
        limits: company.limits
    };
}

export function updateCompanyRuntime(companyId, runtime = {}) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    company.updateRuntime(runtime);

    return companyRepository.update(companyId, company);
}

export function updateCompanyHealth(companyId, health = {}) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    company.updateHealth(health);

    return companyRepository.update(companyId, company);
}

export function updateCompanyStatistics(companyId, statistics = {}) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    company.updateStatistics(statistics);

    return companyRepository.update(companyId, company);
}