export class AuthSession {
    constructor({
        id,
        userId,
        companyId,
        role,
        accessToken,
        refreshToken,
        status = "active",
        metadata = {}
    }) {
        this.id = id;
        this.userId = userId;
        this.companyId = companyId;
        this.role = role;

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        this.status = status;
        this.metadata = metadata;

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.revokedAt = null;
    }

    touch() {
        this.updatedAt = new Date().toISOString();
    }

    revoke() {
        this.status = "revoked";
        this.revokedAt = new Date().toISOString();
        this.touch();

        return this;
    }

    isActive() {
        return this.status === "active";
    }
}