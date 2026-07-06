import { userManager } from "../services/user-manager.service.js";

export function getUsers() {
    return userManager.list();
}

export function getUserById(userId) {
    return userManager.findById(userId);
}

export function getUserByEmail(email) {
    return userManager.findByEmail(email);
}

export function getUsersByCompany(companyId) {
    return userManager.listByCompany(companyId);
}

export function addUser(user) {
    return userManager.create(user);
}

export function updateUser(userId, data) {
    return userManager.update(userId, data);
}

export function removeUser(userId) {
    return userManager.remove(userId);
}

export function countUsersByCompany(companyId) {
    return userManager.countByCompany(companyId);
}