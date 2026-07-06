export class Company {
    constructor({
        id,
        name,
        slug,
        status = "active",
        plan = "free",
        timezone = "America/Sao_Paulo",
        language = "pt-BR",
        limits = {},
        settings = {},
        metadata = {},
        runtime = {},
        health = {},
        statistics = {}
    }) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.status = status;
        this.plan = plan;
        this.timezone = timezone;
        this.language = language;
        this.limits = limits;
        this.settings = settings;
        this.metadata = metadata;

        this.runtime = {
            activeUsers: 0,
            activeWhatsappInstances: 0,
            activeConversations: 0,
            lastActivityAt: null,
            ...runtime
        };

        this.health = {
            status: "healthy",
            lastCheckAt: null,
            issues: [],
            ...health
        };

        this.statistics = {
            totalMessages: 0,
            monthlyMessages: 0,
            aiRequests: 0,
            contacts: 0,
            conversations: 0,
            ...statistics
        };

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    touch() {
        this.updatedAt = new Date().toISOString();
    }

    update(data = {}) {
        Object.assign(this, data);
        this.touch();

        return this;
    }

    updateRuntime(runtime = {}) {
        this.runtime = {
            ...this.runtime,
            ...runtime,
            lastActivityAt: new Date().toISOString()
        };

        this.touch();

        return this;
    }

    updateHealth(health = {}) {
        this.health = {
            ...this.health,
            ...health,
            lastCheckAt: new Date().toISOString()
        };

        this.touch();

        return this;
    }

    updateStatistics(statistics = {}) {
        this.statistics = {
            ...this.statistics,
            ...statistics
        };

        this.touch();

        return this;
    }

    activate() {
        this.status = "active";
        this.touch();

        return this;
    }

    deactivate() {
        this.status = "inactive";
        this.touch();

        return this;
    }

    suspend() {
        this.status = "suspended";
        this.touch();

        return this;
    }

    setPlan(plan, limits = {}) {
        this.plan = plan;
        this.limits = limits;
        this.touch();

        return this;
    }

    canCreateUser(currentUsers = 0) {
        return currentUsers < this.limits.users;
    }

    canCreateWhatsappInstance(currentInstances = 0) {
        return currentInstances < this.limits.whatsappInstances;
    }

    canSendMessage(currentMessages = 0) {
        return currentMessages < this.limits.messagesPerMonth;
    }

    isActive() {
        return this.status === "active";
    }

    isFree() {
        return this.plan === "free";
    }

    isPro() {
        return this.plan === "pro";
    }

    isEnterprise() {
        return this.plan === "enterprise";
    }
}