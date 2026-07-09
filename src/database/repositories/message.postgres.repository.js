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
                content: data.content || null,
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

    async findMessageById(companyId, id) {
        const row = await this.findByIdAndCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
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

    async listMessagesByConversation(companyId, conversationId, options = {}) {
        const {
            limit = 100,
            offset = 0
        } = options;

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
            [companyId, conversationId, limit, offset]
        );

        return rowsToCamelCase(rows);
    }

    async updateMessage(companyId, id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                externalId: data.externalId,
                direction: data.direction,
                type: data.type,
                content: data.content,
                status: data.status,
                provider: data.provider,
                metadata: data.metadata,
                sentAt: data.sentAt,
                deliveredAt: data.deliveredAt,
                readAt: data.readAt,
                failedAt: data.failedAt
            })
        );

        const row = await this.updateByCompany(id, companyId, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async markSent(companyId, id) {
        return this.updateMessage(companyId, id, {
            status: "sent",
            sentAt: new Date().toISOString()
        });
    }

    async markDelivered(companyId, id) {
        return this.updateMessage(companyId, id, {
            status: "delivered",
            deliveredAt: new Date().toISOString()
        });
    }

    async markRead(companyId, id) {
        return this.updateMessage(companyId, id, {
            status: "read",
            readAt: new Date().toISOString()
        });
    }

    async markFailed(companyId, id, error = null) {
        return this.updateMessage(companyId, id, {
            status: "failed",
            failedAt: new Date().toISOString(),
            metadata: {
                error
            }
        });
    }

    async softDeleteMessage(companyId, id) {
        const row = await this.softDeleteByCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }
}

export const messagePostgresRepository = new MessagePostgresRepository();