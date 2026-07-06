export class User {
    constructor({
        id,
        companyId,
        name,
        email,
        passwordHash = null,
        role = "attendant",
        status = "active",
        metadata = {}
    }) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.metadata = metadata;

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

    isActive() {
        return this.status === "active";
    }
}