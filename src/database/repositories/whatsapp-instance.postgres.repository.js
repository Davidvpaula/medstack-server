import { BaseCompanyRepository } from "../base-company.repository.js";

import {
    objectToSnakeCase,
    objectToCamelCase,
    rowsToCamelCase,
    removeUndefined
} from "../repository-utils.js";

class WhatsappInstancePostgresRepository extends BaseCompanyRepository {
    constructor() {
        super("whatsapp_instances");
    }

    async createInstance(data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                companyId: data.companyId,
                instanceKey: data.instanceKey,
                provider: data.provider || "baileys",
                status: data.status || "idle",
                phone: data.phone || null,
                displayName: data.displayName || null,
                sessionStatus: data.sessionStatus || "disconnected",
                lastConnectedAt: data.lastConnectedAt || null,
                lastDisconnectedAt: data.lastDisconnectedAt || null,
                lastError: data.lastError || null,
                metadata: data.metadata || {}
            })
        );

        const row = await this.create(payload);

        return objectToCamelCase(row);
    }

    async findInstanceById(companyId, id) {
        const row = await this.findByIdAndCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }

    async findInstanceByKey(companyId, instanceKey) {
        const rows = await this.raw(
            `
            SELECT *
            FROM whatsapp_instances
            WHERE company_id = $1
            AND instance_key = $2
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [companyId, instanceKey]
        );

        return rows[0] ? objectToCamelCase(rows[0]) : null;
    }

    async listInstancesByCompany(companyId, options = {}) {
        const rows = await this.findAllByCompany(companyId, options);

        return rowsToCamelCase(rows);
    }

    async updateInstance(companyId, id, data = {}) {
        const payload = objectToSnakeCase(
            removeUndefined({
                instanceKey: data.instanceKey,
                provider: data.provider,
                status: data.status,
                phone: data.phone,
                displayName: data.displayName,
                sessionStatus: data.sessionStatus,
                lastConnectedAt: data.lastConnectedAt,
                lastDisconnectedAt: data.lastDisconnectedAt,
                lastError: data.lastError,
                metadata: data.metadata
            })
        );

        const row = await this.updateByCompany(id, companyId, payload);

        return row ? objectToCamelCase(row) : null;
    }

    async markConnected(companyId, id, data = {}) {
        return this.updateInstance(companyId, id, {
            status: "connected",
            sessionStatus: "connected",
            lastConnectedAt: new Date().toISOString(),
            lastError: null,
            phone: data.phone,
            displayName: data.displayName,
            metadata: data.metadata
        });
    }

    async markDisconnected(companyId, id, error = null) {
        return this.updateInstance(companyId, id, {
            status: "disconnected",
            sessionStatus: "disconnected",
            lastDisconnectedAt: new Date().toISOString(),
            lastError: error
        });
    }

    async softDeleteInstance(companyId, id) {
        const row = await this.softDeleteByCompany(id, companyId);

        return row ? objectToCamelCase(row) : null;
    }
}

export const whatsappInstancePostgresRepository =
    new WhatsappInstancePostgresRepository();