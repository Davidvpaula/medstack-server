import bcrypt from "bcryptjs";
import { AUTH_CONFIG } from "../config/auth.config.js";

export async function hashPassword(password) {
    return bcrypt.hash(password, AUTH_CONFIG.password.saltRounds);
}

export async function comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

export function validatePassword(password) {
    if (!password) {
        return false;
    }

    return String(password).length >= AUTH_CONFIG.password.minLength;
}