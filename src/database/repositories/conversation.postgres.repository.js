import { BaseCompanyRepository } from "../base-company.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class ConversationPostgresRepository extends BaseCompanyRepository {
    constructor() {
        super("conversations");
    }

    async createConversation(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                companyId: data.companyId,
                contactId: data.contactId || null,
                whatsappInstanceId: data.whatsappInstanceId || null,
                status: data.status || "open",
                channel: data.channel || "whatsapp",
                lastMessageAt: data.lastMessageAt || null,
                assignedUserId: data.assignedUserId || null,
                metadata: data.metadata || {}
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async listConversations(options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM conversations
            WHERE deleted_at IS NULL
            ORDER BY COALESCE(last_message_at, created_at) DESC
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

    async listConversationsByCompany(companyId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM conversations
            WHERE company_id = $1
            AND deleted_at IS NULL
            ORDER BY COALESCE(last_message_at, created_at) DESC
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

    async listConversationsByContact(contactId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM conversations
            WHERE contact_id = $1
            AND deleted_at IS NULL
            ORDER BY COALESCE(last_message_at, created_at) DESC
            LIMIT $2
            OFFSET $3
            `,
            [
                contactId,
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async findConversationById(id) {
        const rows = await this.raw(
            `
            SELECT *
            FROM conversations
            WHERE id = $1
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [id]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async findOpenByContact(companyId, contactId, channel = "whatsapp") {
        const rows = await this.raw(
            `
            SELECT *
            FROM conversations
            WHERE company_id = $1
            AND contact_id = $2
            AND channel = $3
            AND status = 'open'
            AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [companyId, contactId, channel]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async updateConversation(id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                contactId: data.contactId,
                whatsappInstanceId: data.whatsappInstanceId,
                status: data.status,
                channel: data.channel,
                lastMessageAt: data.lastMessageAt,
                assignedUserId: data.assignedUserId,
                metadata: data.metadata
            })
        );

        const row = await this.update(id, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async markLastMessage(id, date = new Date().toISOString()) {
        return this.updateConversation(id, {
            lastMessageAt: date
        });
    }

    async softDeleteConversation(id) {
        const row = await this.softDelete(id);

        return row ? objectToCamelCase(row) : null;
    }
}

export const conversationPostgresRepository =
    new ConversationPostgresRepository();