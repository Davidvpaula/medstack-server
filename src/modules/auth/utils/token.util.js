import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/auth.config.js";
import { TOKEN_TYPES } from "../constants/auth.constants.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function generateAccessToken(payload) {
    return jwt.sign(
        {
            ...payload,
            type: TOKEN_TYPES.ACCESS
        },
        JWT_SECRET,
        {
            expiresIn: AUTH_CONFIG.jwt.expiresIn,
            issuer: AUTH_CONFIG.jwt.issuer,
            audience: AUTH_CONFIG.jwt.audience
        }
    );
}

export function generateRefreshToken(payload) {
    return jwt.sign(
        {
            ...payload,
            type: TOKEN_TYPES.REFRESH
        },
        JWT_SECRET,
        {
            expiresIn: AUTH_CONFIG.jwt.refreshExpiresIn,
            issuer: AUTH_CONFIG.jwt.issuer,
            audience: AUTH_CONFIG.jwt.audience
        }
    );
}

export function verifyToken(token) {
    return jwt.verify(
        token,
        JWT_SECRET,
        {
            issuer: AUTH_CONFIG.jwt.issuer,
            audience: AUTH_CONFIG.jwt.audience
        }
    );
}