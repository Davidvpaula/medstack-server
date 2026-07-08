import { BaseCompanyRepository } from "../base-company.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class UserPostgresRepository extends BaseCompanyRepository {
    constructor() {
        super("users");
    }

    async createUser(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                companyId: data.companyId,
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash || null,
                role: data.role || "user",
                status: data.status || "active",
                metadata: data.metadata || {}
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async findUserById(companyId, id) {
        const row = await this.findByIdAndCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }

    async findUserByEmail(companyId, email) {
        const rows = await this.raw(
            `
            SELECT *
            FROM users
            WHERE company_id = $1
            AND email = $2
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [companyId, email]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async listUsersByCompany(companyId, options = {}) {
        const rows = await this.findAllByCompany(companyId, options);

        return rowsToCamelCase(rows);
    }

    async updateUser(companyId, id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role,
                status: data.status,
                metadata: data.metadata
            })
        );

        const row = await this.updateByCompany(id, companyId, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async softDeleteUser(companyId, id) {
        const row = await this.softDeleteByCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }
}

export const userPostgresRepository = new UserPostgresRepository();