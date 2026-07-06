class UserManager {
    constructor() {
        this.users = new Map();
    }

    normalizeId(userId) {
        return String(userId || "").trim();
    }

    list() {
        return Array.from(this.users.values());
    }

    findById(userId) {
        return this.users.get(this.normalizeId(userId)) || null;
    }

    findByEmail(email) {
        const normalizedEmail = String(email || "").trim().toLowerCase();

        return this.list().find(
            (user) => user.email.toLowerCase() === normalizedEmail
        ) || null;
    }

    listByCompany(companyId) {
        return this.list().filter(
            (user) => user.companyId === companyId
        );
    }

    create(user) {
        this.users.set(this.normalizeId(user.id), user);

        return user;
    }

    update(userId, data) {
        const user = this.findById(userId);

        if (!user) {
            return null;
        }

        user.update(data);

        this.users.set(this.normalizeId(user.id), user);

        return user;
    }

    remove(userId) {
        return this.users.delete(this.normalizeId(userId));
    }

    countByCompany(companyId) {
        return this.listByCompany(companyId).length;
    }
}

export const userManager = new UserManager();