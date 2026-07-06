export const COMPANY_DEFAULT_LIMITS = {
    users: 1,
    whatsappInstances: 1,
    messagesPerMonth: 1000,
    aiCredits: 0,
    flows: 1,
    webhooks: 1
};

export const COMPANY_PLAN_LIMITS = {
    free: {
        users: 1,
        whatsappInstances: 1,
        messagesPerMonth: 1000,
        aiCredits: 0,
        flows: 1,
        webhooks: 1
    },

    starter: {
        users: 3,
        whatsappInstances: 1,
        messagesPerMonth: 5000,
        aiCredits: 1000,
        flows: 5,
        webhooks: 3
    },

    pro: {
        users: 10,
        whatsappInstances: 3,
        messagesPerMonth: 25000,
        aiCredits: 10000,
        flows: 25,
        webhooks: 10
    },

    enterprise: {
        users: 100,
        whatsappInstances: 20,
        messagesPerMonth: 250000,
        aiCredits: 100000,
        flows: 250,
        webhooks: 100
    }
};