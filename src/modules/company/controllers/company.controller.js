import { response } from "../../../core/response.js";

import {
    getCompanyStatus,
    listCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
} from "../services/company.service.js";

import {
    getCompanyRuntime,
    updateCompanyRuntime,
    updateCompanyHealth,
    updateCompanyStatistics
} from "../services/company-runtime.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status da Company carregado.",
        getCompanyStatus()
    );
}

export function list(req, res) {
    return response.success(
        res,
        "Empresas carregadas.",
        listCompanies()
    );
}

export function show(req, res, next) {
    try {
        return response.success(
            res,
            "Empresa carregada.",
            getCompanyById(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function runtime(req, res, next) {
    try {
        return response.success(
            res,
            "Runtime da empresa carregado.",
            getCompanyRuntime(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const company = await createCompany(req.body);

        return response.success(
            res,
            "Empresa criada.",
            company
        );
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const company = await updateCompany(
            req.params.companyId,
            req.body
        );

        return response.success(
            res,
            "Empresa atualizada.",
            company
        );
    } catch (error) {
        next(error);
    }
}

export async function updateRuntime(req, res, next) {
    try {
        const company = updateCompanyRuntime(
            req.params.companyId,
            req.body
        );

        return response.success(
            res,
            "Runtime da empresa atualizado.",
            company
        );
    } catch (error) {
        next(error);
    }
}

export async function updateHealth(req, res, next) {
    try {
        const company = updateCompanyHealth(
            req.params.companyId,
            req.body
        );

        return response.success(
            res,
            "Health da empresa atualizado.",
            company
        );
    } catch (error) {
        next(error);
    }
}

export async function updateStatistics(req, res, next) {
    try {
        const company = updateCompanyStatistics(
            req.params.companyId,
            req.body
        );

        return response.success(
            res,
            "Statistics da empresa atualizada.",
            company
        );
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        const result = await deleteCompany(
            req.params.companyId
        );

        return response.success(
            res,
            "Empresa removida.",
            result
        );
    } catch (error) {
        next(error);
    }
}