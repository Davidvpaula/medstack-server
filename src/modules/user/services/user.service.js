import { AppError } from "../../../core/errors/AppError.js";

import {
    companyPostgresRepository
} from "../../../database/repositories/company.postgres.repository.js";

import {
    userPostgresRepository
} from "../../../database/repositories/user.postgres.repository.js";

import {
    hashPassword,
    validatePassword
} from "../../auth/utils/password.util.js";

import {
    USER_ROLES,
    USER_STATUS
} from "../constants/index.js";

export function getUserStatus() {
    return {
        module: "user",
        status: "active",
        persistence: "postgres"
    };
}

export async function listUsers() {
    const users = await userPostgresRepository.listUsers();

    return users.map(sanitizeUser);
}

export async function listUsersByCompany(companyId) {
    await ensureCompanyExists(companyId);

    const users = await userPostgresRepository.listUsersByCompany(companyId);

    return users.map(sanitizeUser);
}

export async function getUserById(userId) {
    const user = await userPostgresRepository.findUserById(userId);

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

    const company = await ensureCompanyExists(data.companyId);

    const email = normalizeEmail(data.email);

    const existingUser = await userPostgresRepository.findUserByEmail(
        company.id,
        email
    );

    if (existingUser) {
        throw new AppError("Já existe um usuário com este email.", 409);
    }

    const currentUsers = await userPostgresRepository.countUsersByCompany(
        company.id
    );

    if (!canCreateUser(company, currentUsers)) {
        throw new AppError("Limite de usuários atingido para esta empresa.", 403);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userPostgresRepository.createUser({
        companyId: company.id,
        name: data.name,
        email,
        passwordHash,
        role: data.role || USER_ROLES.ATTENDANT,
        status: data.status || USER_STATUS.ACTIVE,
        metadata: data.metadata || {}
    });

    return sanitizeUser(user);
}

export async function updateUser(userId, data) {
    const currentUser = await userPostgresRepository.findUserById(userId);

    if (!currentUser) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    const updateData = {
        ...data
    };

    if (updateData.email) {
        updateData.email = normalizeEmail(updateData.email);

        const existingUser = await userPostgresRepository.findUserByEmail(
            currentUser.companyId,
            updateData.email
        );

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

    const updatedUser = await userPostgresRepository.updateUser(
        userId,
        updateData
    );

    return sanitizeUser(updatedUser);
}

export async function deleteUser(userId) {
    const user = await userPostgresRepository.findUserById(userId);

    if (!user) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    await userPostgresRepository.softDeleteUser(userId);

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

async function ensureCompanyExists(companyId) {
    const company = await companyPostgresRepository.findCompanyById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function canCreateUser(company, currentUsers) {
    const maxUsers = company.metadata?.limits?.users;

    if (!maxUsers) {
        return true;
    }

    return currentUsers < maxUsers;
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}