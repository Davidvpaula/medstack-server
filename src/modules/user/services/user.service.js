import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";
import { User } from "../entities/user.entity.js";
import { userRepository } from "../repositories/user.repository.js";

import { hashPassword, validatePassword } from "../../auth/utils/password.util.js";

import { USER_ROLES, USER_STATUS } from "../constants/index.js";

export function getUserStatus() {
    return {
        module: "user",
        status: "active"
    };
}

export function listUsers() {
    return userRepository.list().map(sanitizeUser);
}

export function listUsersByCompany(companyId) {
    ensureCompanyExists(companyId);

    return userRepository.listByCompany(companyId).map(sanitizeUser);
}

export function getUserById(userId) {
    const user = userRepository.findById(userId);

    if (!user) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    return sanitizeUser(user);
}

export async function createUser(data) {
    if (!data?.companyId) {
        throw new AppError("Informe companyId.", 400);
    }

    if (!data?.name) {
        throw new AppError("Informe o nome do usuário.", 400);
    }

    if (!data?.email) {
        throw new AppError("Informe o email do usuário.", 400);
    }

    if (!validatePassword(data.password)) {
        throw new AppError("A senha deve ter pelo menos 8 caracteres.", 400);
    }

    const company = ensureCompanyExists(data.companyId);

    const existingUser = userRepository.findByEmail(data.email);

    if (existingUser) {
        throw new AppError("Já existe um usuário com este email.", 409);
    }

    const currentUsers = userRepository.countByCompany(company.id);

    if (!company.canCreateUser(currentUsers)) {
        throw new AppError("Limite de usuários atingido para esta empresa.", 403);
    }

    const passwordHash = await hashPassword(data.password);

    const user = new User({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: company.id,
        name: data.name,
        email: normalizeEmail(data.email),
        passwordHash,
        role: data.role || USER_ROLES.ATTENDANT,
        status: data.status || USER_STATUS.ACTIVE,
        metadata: data.metadata || {}
    });

    company.updateRuntime({
        activeUsers: currentUsers + 1
    });

    return sanitizeUser(userRepository.create(user));
}

export async function updateUser(userId, data) {
    const currentUser = userRepository.findById(userId);

    if (!currentUser) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    const updateData = {
        ...data
    };

    if (updateData.email) {
        updateData.email = normalizeEmail(updateData.email);

        const existingUser = userRepository.findByEmail(updateData.email);

        if (existingUser && existingUser.id !== currentUser.id) {
            throw new AppError("Já existe um usuário com este email.", 409);
        }
    }

    if (updateData.password) {
        if (!validatePassword(updateData.password)) {
            throw new AppError("A senha deve ter pelo menos 8 caracteres.", 400);
        }

        updateData.passwordHash = await hashPassword(updateData.password);
        delete updateData.password;
    }

    return sanitizeUser(userRepository.update(userId, updateData));
}

export async function deleteUser(userId) {
    const user = userRepository.findById(userId);

    if (!user) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    const company = companyRepository.findById(user.companyId);

    if (company) {
        const currentUsers = userRepository.countByCompany(company.id);

        company.updateRuntime({
            activeUsers: Math.max(currentUsers - 1, 0)
        });
    }

    userRepository.remove(userId);

    return {
        deleted: true,
        userId
    };
}

export function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    const {
        passwordHash,
        ...safeUser
    } = user;

    return safeUser;
}

function ensureCompanyExists(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}