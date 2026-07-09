import { BaseCompanyRepository } from "../base-company.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class ContactPostgresRepository extends BaseCompanyRepository {
    constructor() {
        super("contacts");
    }

    async createContact(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                companyId: data.companyId,
                name: data.name || null,
                phone: data.phone,
                email: data.email || null,
                source: data.source || "whatsapp",
                status: data.status || "active",
                metadata: data.metadata || {}
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async listContacts(options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $1
            OFFSET $2
            `,
            [
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async listContactsByCompany(companyId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE company_id = $1
            AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET $3
            `,
            [
                companyId,
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async findContactById(id) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE id = $1
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [id]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async findContactByCompanyAndId(companyId, id) {
        const row = await this.findByIdAndCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }

    async findContactByPhone(companyId, phone) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE company_id = $1
            AND phone = $2
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [companyId, phone]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async searchContactsByName(companyId, name, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE company_id = $1
            AND deleted_at IS NULL
            AND LOWER(COALESCE(name, '')) LIKE LOWER($2)
            ORDER BY created_at DESC
            LIMIT $3
            OFFSET $4
            `,
            [
                companyId,
                `%${name || ""}%`,
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async listFavoriteContacts(companyId, options = {}) {
        return this.listByMetadataFlag(companyId, "favorite", true, options);
    }

    async listArchivedContacts(companyId, options = {}) {
        return this.listByMetadataFlag(companyId, "archived", true, options);
    }

    async listBlockedContacts(companyId, options = {}) {
        return this.listByMetadataFlag(companyId, "blocked", true, options);
    }

    async listByMetadataFlag(companyId, field, value, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM contacts
            WHERE company_id = $1
            AND deleted_at IS NULL
            AND metadata ->> $2 = $3
            ORDER BY created_at DESC
            LIMIT $4
            OFFSET $5
            `,
            [
                companyId,
                field,
                String(value),
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async updateContact(id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                name: data.name,
                phone: data.phone,
                email: data.email,
                source: data.source,
                status: data.status,
                metadata: data.metadata
            })
        );

        const row = await this.update(id, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async updateContactByCompany(companyId, id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                name: data.name,
                phone: data.phone,
                email: data.email,
                source: data.source,
                status: data.status,
                metadata: data.metadata
            })
        );

        const row = await this.updateByCompany(id, companyId, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async softDeleteContact(id) {
        const row = await this.softDelete(id);

        return row ? objectToCamelCase(row) : null;
    }

    async softDeleteContactByCompany(companyId, id) {
        const row = await this.softDeleteByCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }
}

export const contactPostgresRepository = new ContactPostgresRepository();