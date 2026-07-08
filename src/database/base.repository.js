import {
    query,
    transaction
} from "./postgres.client.js";

export class BaseRepository {
    constructor(tableName) {
        if (!tableName) {
            throw new Error("Informe tableName no BaseRepository.");
        }

        this.tableName = tableName;
    }

    async findAll(options = {}) {
        const {
            limit = 100,
            offset = 0,
            orderBy = "created_at",
            orderDirection = "DESC"
        } = options;

        const sql = `
            SELECT *
            FROM ${this.tableName}
            ORDER BY ${orderBy} ${orderDirection}
            LIMIT $1
            OFFSET $2
        `;

        const result = await query(sql, [limit, offset]);

        return result.rows;
    }

    async findById(id) {
        const sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE id = $1
            LIMIT 1
        `;

        const result = await query(sql, [id]);

        return result.rows[0] || null;
    }

    async findBy(field, value) {
        const sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE ${field} = $1
            LIMIT 1
        `;

        const result = await query(sql, [value]);

        return result.rows[0] || null;
    }

    async findManyBy(field, value, options = {}) {
        const {
            limit = 100,
            offset = 0,
            orderBy = "created_at",
            orderDirection = "DESC"
        } = options;

        const sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE ${field} = $1
            ORDER BY ${orderBy} ${orderDirection}
            LIMIT $2
            OFFSET $3
        `;

        const result = await query(sql, [value, limit, offset]);

        return result.rows;
    }

    async create(data = {}) {
        const columns = Object.keys(data);
        const values = Object.values(data);

        if (!columns.length) {
            throw new Error("Nenhum dado informado para create().");
        }

        const placeholders = columns.map((_, index) => `$${index + 1}`);

        const sql = `
            INSERT INTO ${this.tableName}
            (${columns.join(", ")})
            VALUES (${placeholders.join(", ")})
            RETURNING *
        `;

        const result = await query(sql, values);

        return result.rows[0];
    }

    async update(id, data = {}) {
        const columns = Object.keys(data);
        const values = Object.values(data);

        if (!columns.length) {
            return this.findById(id);
        }

        const setClause = columns
            .map((column, index) => `${column} = $${index + 2}`)
            .join(", ");

        const sql = `
            UPDATE ${this.tableName}
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const result = await query(sql, [id, ...values]);

        return result.rows[0] || null;
    }

    async delete(id) {
        const sql = `
            DELETE FROM ${this.tableName}
            WHERE id = $1
            RETURNING *
        `;

        const result = await query(sql, [id]);

        return result.rows[0] || null;
    }

    async softDelete(id) {
        const sql = `
            UPDATE ${this.tableName}
            SET deleted_at = NOW(), updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const result = await query(sql, [id]);

        return result.rows[0] || null;
    }

    async exists(id) {
        const sql = `
            SELECT 1
            FROM ${this.tableName}
            WHERE id = $1
            LIMIT 1
        `;

        const result = await query(sql, [id]);

        return Boolean(result.rows[0]);
    }

    async count(where = {}) {
        const columns = Object.keys(where);
        const values = Object.values(where);

        if (!columns.length) {
            const result = await query(`
                SELECT COUNT(*)::int AS total
                FROM ${this.tableName}
            `);

            return result.rows[0].total;
        }

        const whereClause = columns
            .map((column, index) => `${column} = $${index + 1}`)
            .join(" AND ");

        const result = await query(`
            SELECT COUNT(*)::int AS total
            FROM ${this.tableName}
            WHERE ${whereClause}
        `, values);

        return result.rows[0].total;
    }

    async raw(sql, params = []) {
        const result = await query(sql, params);

        return result.rows;
    }

    async transaction(callback) {
        return transaction(callback);
    }
}