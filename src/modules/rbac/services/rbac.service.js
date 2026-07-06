import {
    getParentRole,
    getDirectRolePermissions
} from "../constants/rbac-role-permissions.constants.js";

export function getPermissions(role) {
    const permissions = new Set();

    collectPermissions(role, permissions);

    return Array.from(permissions);
}

export function hasPermission(role, permission) {
    return getPermissions(role).includes(permission);
}

export function hasAnyPermission(role, permissions = []) {
    return permissions.some((permission) =>
        hasPermission(role, permission)
    );
}

export function hasAllPermissions(role, permissions = []) {
    return permissions.every((permission) =>
        hasPermission(role, permission)
    );
}

function collectPermissions(role, permissions) {
    const parentRole = getParentRole(role);

    if (parentRole) {
        collectPermissions(parentRole, permissions);
    }

    for (const permission of getDirectRolePermissions(role)) {
        permissions.add(permission);
    }
}