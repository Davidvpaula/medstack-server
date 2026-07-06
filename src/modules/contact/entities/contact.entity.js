function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

export class Contact {
    constructor(data = {}) {

        this.id = data.id;

        this.companyId = data.companyId;

        this.name = data.name;

        this.phone = data.phone;

        this.phoneNormalized = normalizePhone(data.phone);

        this.email = data.email || "";

        this.avatar = data.avatar || "";

        this.city = data.city || "";

        this.state = data.state || "";

        this.country = data.country || "Brasil";

        this.document = data.document || "";

        this.birthDate = data.birthDate || null;

        this.source = data.source || "manual";

        this.channel = data.channel || "whatsapp";

        this.ownerId = data.ownerId || null;

        this.tags = data.tags || [];

        this.notes = data.notes || [];

        this.customFields = data.customFields || {};

        this.metadata = data.metadata || {};

        this.favorite = false;

        this.blocked = false;

        this.archived = false;

        this.status = data.status || "active";

        this.lastConversationId = null;

        this.lastMessageId = null;

        this.lastActivityAt = null;

        this.createdAt = new Date().toISOString();

        this.updatedAt = new Date().toISOString();
    }

    update(data = {}) {

        Object.assign(this, data);

        if (data.phone) {
            this.phoneNormalized = normalizePhone(data.phone);
        }

        this.updatedAt = new Date().toISOString();

        return this;
    }

    markActivity() {

        this.lastActivityAt = new Date().toISOString();

        this.updatedAt = this.lastActivityAt;

        return this;
    }
}