import {
    getCompanies,
    getCompanyById,
    getCompanyBySlug,
    addCompany,
    updateCompany,
    removeCompany
} from "../stores/company.store.js";

export const companyRepository = {
    list() {
        return getCompanies();
    },

    findById(companyId) {
        return getCompanyById(companyId);
    },

    findBySlug(slug) {
        return getCompanyBySlug(slug);
    },

    create(company) {
        return addCompany(company);
    },

    update(companyId, data) {
        return updateCompany(companyId, data);
    },

    remove(companyId) {
        return removeCompany(companyId);
    }
};