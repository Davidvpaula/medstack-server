export const env = {
    PORT: process.env.PORT || 3000,

    NODE_ENV: process.env.NODE_ENV || "development",

    APP_NAME: process.env.APP_NAME || "MedStack",

    APP_VERSION: process.env.APP_VERSION || "1.0.0",

    JWT_SECRET: process.env.JWT_SECRET || "",

    SUPABASE_URL: process.env.SUPABASE_URL || "",

    SUPABASE_KEY: process.env.SUPABASE_KEY || "",

    OPENAI_KEY: process.env.OPENAI_KEY || "",

    GEMINI_KEY: process.env.GEMINI_KEY || ""
};