export const AUTH_CONFIG = {
    jwt: {
        issuer: "MedStack",
        audience: "MedStack-API",
        expiresIn: "7d",
        refreshExpiresIn: "30d"
    },

    password: {
        saltRounds: 10,
        minLength: 8
    },

    login: {
        maxAttempts: 5,
        blockMinutes: 15
    }
};