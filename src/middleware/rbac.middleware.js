import { AppError } from "../core/errors/AppError.js";
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
} from "../modules/rbac/index.js";

export function requirePermission(permission) {
    return function permissionMiddleware(req, res, next) {
        try {
            if (!req.auth?.role) {
                throw new AppError("Usuário não autenticado.", 401);
            }

            if (!hasPermission(req.auth.role, permission)) {
                throw new AppError("Permissão insuficiente.", 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

export function requireAnyPermission(permissions = []) {
    return function anyPermissionMiddleware(req, res, next) {
        try {
            if (!req.auth?.role) {
                throw new AppError("Usuário não autenticado.", 401);
            }

            if (!hasAnyPermission(req.auth.role, permissions)) {
                throw new AppError("Permissão insuficiente.", 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

export function requireAllPermissions(permissions = []) {
    return function allPermissionsMiddleware(req, res, next) {
        try {
            if (!req.auth?.role) {
                throw new AppError("Usuário não autenticado.", 401);
            }

            if (!hasAllPermissions(req.auth.role, permissions)) {
                throw new AppError("Permissão insuficiente.", 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}