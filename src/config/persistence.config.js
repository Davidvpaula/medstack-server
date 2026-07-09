import "dotenv/config";

export const persistenceConfig = {
    driver: process.env.PERSISTENCE_DRIVER || "memory",

    isMemory() {
        return this.driver === "memory";
    },

    isPostgres() {
        return this.driver === "postgres";
    }
};