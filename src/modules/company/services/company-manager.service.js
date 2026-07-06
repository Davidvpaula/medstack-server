class CompanyManager {
    constructor() {
        this.companies = new Map();
    }

    normalizeId(companyId) {
        return String(companyId || "").trim();
    }

    list() {
        return Array.from(this.companies.values());
    }

    findById(companyId) {
        const normalizedId = this.normalizeId(companyId);

        const directCompany = this.companies.get(normalizedId);

        if (directCompany) {
            return directCompany;
        }

        return this.list().find(
            (company) => this.normalizeId(company.id) === normalizedId
        ) || null;
    }

    findBySlug(slug) {
        const normalizedSlug = String(slug || "").trim();

        return this.list().find(
            (company) => company.slug === normalizedSlug
        ) || null;
    }

    create(company) {
        this.companies.set(
            this.normalizeId(company.id),
            company
        );

        return company;
    }

    update(companyId, data) {
        const company = this.findById(companyId);

        if (!company) {
            return null;
        }

        company.update(data);

        this.companies.set(
            this.normalizeId(company.id),
            company
        );

        return company;
    }

    remove(companyId) {
        return this.companies.delete(
            this.normalizeId(companyId)
        );
    }

    exists(companyId) {
        return Boolean(this.findById(companyId));
    }

    count() {
        return this.companies.size;
    }

    clear() {
        this.companies.clear();
    }
}

export const companyManager = new CompanyManager();