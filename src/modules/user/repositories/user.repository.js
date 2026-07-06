import {
    getUsers,
    getUserById,
    getUserByEmail,
    getUsersByCompany,
    addUser,
    updateUser,
    removeUser,
    countUsersByCompany
} from "../stores/user.store.js";

export const userRepository = {
    list() {
        return getUsers();
    },

    findById(userId) {
        return getUserById(userId);
    },

    findByEmail(email) {
        return getUserByEmail(email);
    },

    listByCompany(companyId) {
        return getUsersByCompany(companyId);
    },

    create(user) {
        return addUser(user);
    },

    update(userId, data) {
        return updateUser(userId, data);
    },

    remove(userId) {
        return removeUser(userId);
    },

    countByCompany(companyId) {
        return countUsersByCompany(companyId);
    }
};