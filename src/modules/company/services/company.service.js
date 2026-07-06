import { AppError } from "../../../core/errors/AppError.js";

import { Company } from "../entities/company.entity.js";
import { companyRepository } from "../repositories/company.repository.js";

import {
    COMPANY_DEFAULT_CONFIG,
    getCompanyPlanLimits
} from "../config/company.config.js";

import { COMPANY_PLANS } from "../config/company-plan.config.js";
import { createSlug } from "../utils/slug.util.js";

export function getCompanyStatus() {
    return {
        module: "company",
        status: "active"
    };
}

export function listCompanies() {
    return companyRepository.list();
}

export function getCompanyById(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

export async function createCompany(data) {
    if (!data?.name) {
        throw new AppError("Informe o nome da empresa.", 400);
    }

    const slug = data.slug || createSlug(data.name);

    const existingCompany = companyRepository.findBySlug(slug);

    if (existingCompany) {
        throw new AppError("Já existe uma empresa com este slug.", 409);
    }

    const plan = data.plan || COMPANY_PLANS.FREE;
    const planLimits = getCompanyPlanLimits(plan);

    const company = new Company({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: data.name,
        slug,
        status: data.status || COMPANY_DEFAULT_CONFIG.status,
        plan,
        timezone: data.timezone || COMPANY_DEFAULT_CONFIG.timezone,
        language: data.language || COMPANY_DEFAULT_CONFIG.language,
        limits: {
            ...planLimits,
            ...(data.limits || {})
        },
        settings: data.settings || COMPANY_DEFAULT_CONFIG.settings,
        metadata: data.metadata || COMPANY_DEFAULT_CONFIG.metadata
    });

    return companyRepository.create(company);
}

export async function updateCompany(companyId, data) {
    const company = getCompanyById(companyId);

    const updateData = {
        ...data
    };

    if (data?.name && !data.slug) {
        updateData.slug = createSlug(data.name);
    }

    if (updateData.slug) {
        const existingCompany = companyRepository.findBySlug(updateData.slug);

        if (existingCompany && existingCompany.id !== company.id) {
            throw new AppError("Já existe uma empresa com este slug.", 409);
        }
    }

    if (updateData.plan) {
        updateData.limits = {
            ...getCompanyPlanLimits(updateData.plan),
            ...(updateData.limits || {})
        };
    }

    return companyRepository.update(companyId, updateData);
}

export async function deleteCompany(companyId) {
    getCompanyById(companyId);

    companyRepository.remove(companyId);

    return {
        deleted: true,
        companyId
    };
}