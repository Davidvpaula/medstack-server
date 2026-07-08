import { BaseRepository } from "./base.repository.js";

export class BaseCompanyRepository extends BaseRepository {
    async findAllByCompany(companyId, options = {}) {
        return this.findManyBy("company_id", companyId, options);
    }

    async findByIdAndCompany(id, companyId) {
        const sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE id = $1
            AND company_id = $2
            LIMIT 1
        `;

        const rows = await this.raw(sql, [id, companyId]);

        return rows[0] || null;
    }

    async updateByCompany(id, companyId, data = {}) {
        const columns = Object.keys(data);
        const values = Object.values(data);

        if (!columns.length) {
            return this.findByIdAndCompany(id, companyId);
        }

        const setClause = columns
            .map((column, index) => `${column} = $${index + 3}`)
            .join(", ");

        const sql = `
            UPDATE ${this.tableName}
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            AND company_id = $2
            RETURNING *
        `;

        const rows = await this.raw(sql, [id, companyId, ...values]);

        return rows[0] || null;
    }

    async deleteByCompany(id, companyId) {
        const sql = `
            DELETE FROM ${this.tableName}
            WHERE id = $1
            AND company_id = $2
            RETURNING *
        `;

        const rows = await this.raw(sql, [id, companyId]);

        return rows[0] || null;
    }

    async softDeleteByCompany(id, companyId) {
        const sql = `
            UPDATE ${this.tableName}
            SET deleted_at = NOW(), updated_at = NOW()
            WHERE id = $1
            AND company_id = $2
            RETURNING *
        `;

        const rows = await this.raw(sql, [id, companyId]);

        return rows[0] || null;
    }

    async countByCompany(companyId) {
        return this.count({
            company_id: companyId
        });
    }
}