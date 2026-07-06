import { AppError } from "../../../core/errors/AppError.js";

import { createCompany } from "../../company/services/company.service.js";
import { createUser, sanitizeUser } from "../../user/services/user.service.js";
import { userRepository } from "../../user/repositories/user.repository.js";

import { AuthSession } from "../entities/auth-session.entity.js";
import { authRepository } from "../repositories/auth.repository.js";

import { comparePassword } from "../utils/password.util.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
} from "../utils/token.util.js";

export async function register(data) {
    if (!data?.companyName) {
        throw new AppError("Informe companyName.", 400);
    }

    if (!data?.name) {
        throw new AppError("Informe o nome do usuário.", 400);
    }

    if (!data?.email) {
        throw new AppError("Informe o email.", 400);
    }

    if (!data?.password) {
        throw new AppError("Informe a senha.", 400);
    }

    const company = await createCompany({
        name: data.companyName,
        plan: data.plan || "starter"
    });

    const user = await createUser({
        companyId: company.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: "owner"
    });

    const auth = await login({
        email: data.email,
        password: data.password
    });

    return {
        company,
        user,
        ...auth
    };
}

export async function login(data) {
    if (!data?.email) {
        throw new AppError("Informe o email.", 400);
    }

    if (!data?.password) {
        throw new AppError("Informe a senha.", 400);
    }

    const email = String(data.email).trim().toLowerCase();

    const user = userRepository.findByEmail(email);

    if (!user) {
        throw new AppError("Email ou senha inválidos.", 401);
    }

    if (!user.isActive()) {
        throw new AppError("Usuário inativo.", 403);
    }

    const passwordMatches = await comparePassword(
        data.password,
        user.passwordHash
    );

    if (!passwordMatches) {
        throw new AppError("Email ou senha inválidos.", 401);
    }

    const tokenPayload = {
        userId: user.id,
        companyId: user.companyId,
        role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const session = new AuthSession({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
        accessToken,
        refreshToken
    });

    authRepository.create(session);

    return {
        user: sanitizeUser(user),
        sessionId: session.id,
        accessToken,
        refreshToken
    };
}

export function refreshToken(data) {
    if (!data?.refreshToken) {
        throw new AppError("Informe o refreshToken.", 400);
    }

    const session = authRepository.findByRefreshToken(data.refreshToken);

    if (!session || !session.isActive()) {
        throw new AppError("Sessão inválida.", 401);
    }

    const decoded = verifyToken(data.refreshToken);

    const accessToken = generateAccessToken({
        userId: decoded.userId,
        companyId: decoded.companyId,
        role: decoded.role
    });

    authRepository.update(session.id, {
        accessToken
    });

    return {
        accessToken
    };
}

export function logout(data) {
    if (!data?.refreshToken) {
        throw new AppError("Informe o refreshToken.", 400);
    }

    const session = authRepository.findByRefreshToken(data.refreshToken);

    if (session) {
        session.revoke();
    }

    return {
        loggedOut: true
    };
}

export function getAuthStatus() {
    return {
        module: "auth",
        status: "active"
    };
}