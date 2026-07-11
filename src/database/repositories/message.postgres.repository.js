import { BaseCompanyRepository } from "../base-company.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class MessagePostgresRepository extends BaseCompanyRepository {
    constructor() {
        super("messages");
    }

    async createMessage(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                companyId: data.companyId,
                conversationId: data.conversationId,
                contactId: data.contactId || null,
                whatsappInstanceId: data.whatsappInstanceId || null,
                externalId: data.externalId || null,
                direction: data.direction,
                type: data.type || "text",
                content: data.content || data.text || null,
                status: data.status || "created",
                provider: data.provider || "baileys",
                metadata: data.metadata || {},
                sentAt: data.sentAt || null,
                deliveredAt: data.deliveredAt || null,
                readAt: data.readAt || null,
                failedAt: data.failedAt || null
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async listMessages(options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
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

    async listMessagesByCompany(companyId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
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

    async listMessagesByConversation(companyId, conversationId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
            WHERE company_id = $1
            AND conversation_id = $2
            AND deleted_at IS NULL
            ORDER BY created_at ASC
            LIMIT $3
            OFFSET $4
            `,
            [
                companyId,
                conversationId,
                options.limit || 100,
                options.offset || 0
            ]
        );

        return rowsToCamelCase(rows);
    }

    async listMessagesByContact(contactId, options = {}) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
            WHERE contact_id = $1
            AND deleted_at IS NULL
            ORDER BY created_at DESC
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

    async findMessageById(id) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
            WHERE id = $1
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [id]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async findMessageByExternalId(companyId, externalId) {
        const rows = await this.raw(
            `
            SELECT *
            FROM messages
            WHERE company_id = $1
            AND external_id = $2
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [companyId, externalId]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async updateMessage(id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                externalId: data.externalId,
                direction: data.direction,
                type: data.type,
                content: data.content || data.text,
                status: data.status,
                provider: data.provider,
                metadata: data.metadata,
                sentAt: data.sentAt,
                deliveredAt: data.deliveredAt,
                readAt: data.readAt,
                failedAt: data.failedAt
            })
        );

        const row = await this.update(id, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async markSent(id) {
        return this.updateMessage(id, {
            status: "sent",
            sentAt: new Date().toISOString()
        });
    }

    async markDelivered(id) {
        return this.updateMessage(id, {
            status: "delivered",
            deliveredAt: new Date().toISOString()
        });
    }

    async markRead(id) {
        return this.updateMessage(id, {
            status: "read",
            readAt: new Date().toISOString()
        });
    }

    async markFailed(id, error = null) {
        const message = await this.findMessageById(id);

        return this.updateMessage(id, {
            status: "failed",
            failedAt: new Date().toISOString(),
            metadata: {
                ...(message?.metadata || {}),
                error
            }
        });
    }

    async softDeleteMessage(id) {
        const row = await this.softDelete(id);

        return row ? objectToCamelCase(row) : null;
    }
}

export const messagePostgresRepository = new MessagePostgresRepository();