import { response } from "../../../core/response.js";

import {
    getAuthStatus,
    register,
    login,
    refreshToken,
    logout
} from "../services/auth.service.js";

import { sanitizeUser } from "../../user/services/user.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do Auth carregado.",
        getAuthStatus()
    );
}

export function me(req, res) {
    return response.success(
        res,
        "Usuário autenticado carregado.",
        {
            auth: req.auth,
            user: sanitizeUser(req.user)
        }
    );
}

export async function registerController(req, res, next) {
    try {
        const data = await register(req.body);

        return response.success(
            res,
            "Registro realizado.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export async function loginController(req, res, next) {
    try {
        const data = await login(req.body);

        return response.success(
            res,
            "Login realizado.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export function refreshController(req, res, next) {
    try {
        return response.success(
            res,
            "Token atualizado.",
            refreshToken(req.body)
        );
    } catch (error) {
        next(error);
    }
}

export function logoutController(req, res, next) {
    try {
        return response.success(
            res,
            "Logout realizado.",
            logout(req.body)
        );
    } catch (error) {
        next(error);
    }
}