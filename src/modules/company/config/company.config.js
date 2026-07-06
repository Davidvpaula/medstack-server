import { COMPANY_PLANS } from "./company-plan.config.js";
import {
    COMPANY_DEFAULT_LIMITS,
    COMPANY_PLAN_LIMITS
} from "./company-limits.config.js";

export const COMPANY_DEFAULT_CONFIG = {
    status: "active",
    plan: COMPANY_PLANS.FREE,
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    limits: COMPANY_DEFAULT_LIMITS,
    settings: {},
    metadata: {}
};

export function getCompanyPlanLimits(plan = COMPANY_PLANS.FREE) {
    return COMPANY_PLAN_LIMITS[plan] || COMPANY_DEFAULT_LIMITS;
}