import { BaseRepository } from "../base.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class CompanyPostgresRepository extends BaseRepository {
    constructor() {
        super("companies");
    }

    async createCompany(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                name: data.name,
                slug: data.slug,
                status: data.status || "active",
                plan: data.plan || "free",
                document: data.document || null,
                email: data.email || null,
                phone: data.phone || null,
                metadata: data.metadata || {}
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async findCompanyById(id) {
        const row = await this.findById(id);

        return row ? objectToCamelCase(row) : null;
    }

    async findCompanyBySlug(slug) {
        const row = await this.findBy("slug", slug);

        return row ? objectToCamelCase(row) : null;
    }

    async listCompanies(options = {}) {
        const rows = await this.findAll(options);

        return rowsToCamelCase(rows);
    }

    async updateCompany(id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                name: data.name,
                slug: data.slug,
                status: data.status,
                plan: data.plan,
                document: data.document,
                email: data.email,
                phone: data.phone,
                metadata: data.metadata
            })
        );

        const row = await this.update(id, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async softDeleteCompany(id) {
        const row = await this.softDelete(id);

        return row ? objectToCamelCase(row) : null;
    }
}

export const companyPostgresRepository = new CompanyPostgresRepository();