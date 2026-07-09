import { AppError } from "../../../core/errors/AppError.js";

import {
    companyPostgresRepository
} from "../../../database/repositories/company.postgres.repository.js";

import {
    COMPANY_DEFAULT_CONFIG,
    getCompanyPlanLimits
} from "../config/company.config.js";

import { COMPANY_PLANS } from "../config/company-plan.config.js";
import { createSlug } from "../utils/slug.util.js";

export function getCompanyStatus() {
    return {
        module: "company",
        status: "active",
        persistence: "postgres"
    };
}

export async function listCompanies() {
    return companyPostgresRepository.listCompanies();
}

export async function getCompanyById(companyId) {
    const company = await companyPostgresRepository.findCompanyById(companyId);

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

    const existingCompany = await companyPostgresRepository.findCompanyBySlug(slug);

    if (existingCompany) {
        throw new AppError("Já existe uma empresa com este slug.", 409);
    }

    const plan = data.plan || COMPANY_PLANS.FREE;
    const planLimits = getCompanyPlanLimits(plan);

    return companyPostgresRepository.createCompany({
        name: data.name,
        slug,
        status: data.status || COMPANY_DEFAULT_CONFIG.status,
        plan,
        document: data.document || null,
        email: data.email || null,
        phone: data.phone || null,
        metadata: {
            timezone: data.timezone || COMPANY_DEFAULT_CONFIG.timezone,
            language: data.language || COMPANY_DEFAULT_CONFIG.language,
            limits: {
                ...planLimits,
                ...(data.limits || {})
            },
            settings: data.settings || COMPANY_DEFAULT_CONFIG.settings,
            ...(data.metadata || {})
        }
    });
}

export async function updateCompany(companyId, data) {
    const company = await getCompanyById(companyId);

    const updateData = {
        ...data
    };

    if (data?.name && !data.slug) {
        updateData.slug = createSlug(data.name);
    }

    if (updateData.slug) {
        const existingCompany = await companyPostgresRepository.findCompanyBySlug(
            updateData.slug
        );

        if (existingCompany && existingCompany.id !== company.id) {
            throw new AppError("Já existe uma empresa com este slug.", 409);
        }
    }

    const metadata = {
        ...(company.metadata || {})
    };

    if (updateData.plan) {
        metadata.limits = {
            ...getCompanyPlanLimits(updateData.plan),
            ...(data.limits || {})
        };
    }

    if (data.timezone) {
        metadata.timezone = data.timezone;
    }

    if (data.language) {
        metadata.language = data.language;
    }

    if (data.settings) {
        metadata.settings = data.settings;
    }

    if (data.metadata) {
        Object.assign(metadata, data.metadata);
    }

    return companyPostgresRepository.updateCompany(companyId, {
        name: updateData.name,
        slug: updateData.slug,
        status: updateData.status,
        plan: updateData.plan,
        document: updateData.document,
        email: updateData.email,
        phone: updateData.phone,
        metadata
    });
}

export async function deleteCompany(companyId) {
    await getCompanyById(companyId);

    await companyPostgresRepository.softDeleteCompany(companyId);

    return {
        deleted: true,
        companyId
    };
}