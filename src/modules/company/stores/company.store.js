import { companyManager } from "../services/company-manager.service.js";

export function getCompanies() {
    return companyManager.list();
}

export function getCompanyById(companyId) {
    return companyManager.findById(companyId);
}

export function getCompanyBySlug(slug) {
    return companyManager.findBySlug(slug);
}

export function addCompany(company) {
    return companyManager.create(company);
}

export function updateCompany(companyId, data) {
    return companyManager.update(companyId, data);
}

export function removeCompany(companyId) {
    return companyManager.remove(companyId);
}