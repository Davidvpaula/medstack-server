import "dotenv/config";

export const databaseConfig = {
    url: process.env.DATABASE_URL || "",
    ssl: process.env.DATABASE_SSL === "true",
    pool: {
        min: Number(process.env.DATABASE_POOL_MIN || 0),
        max: Number(process.env.DATABASE_POOL_MAX || 10)
    }
};