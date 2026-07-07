import {
    buildAdvisorPrompt
} from "./ai-advisor-prompt-builder.service.js";

const externalAiConfig = {
    enabled: false,
    provider: null,
    model: null,
    lastCallAt: null,
    lastError: null
};

export function getExternalAiStatus() {
    return {
        enabled: externalAiConfig.enabled,
        provider: externalAiConfig.provider,
        model: externalAiConfig.model,
        lastCallAt: externalAiConfig.lastCallAt,
        lastError: externalAiConfig.lastError,
        safety: {
            canModifyCode: false,
            canDeploy: false,
            canDeleteData: false,
            canRunCommands: false,
            readOnly: true
        }
    };
}

export async function askExternalAiAdvisor(question = "") {
    const prompt = buildAdvisorPrompt(question);

    if (!externalAiConfig.enabled) {
        return {
            type: "external_ai_response",
            enabled: false,
            provider: externalAiConfig.provider,
            model: externalAiConfig.model,
            generatedAt: new Date().toISOString(),
            message: "AI externa ainda está desativada.",
            promptPreview: buildPromptPreview(prompt),
            safety: getExternalAiStatus().safety
        };
    }

    externalAiConfig.lastCallAt = new Date().toISOString();

    return {
        type: "external_ai_response",
        enabled: true,
        provider: externalAiConfig.provider,
        model: externalAiConfig.model,
        generatedAt: new Date().toISOString(),
        message: "Provider externo ainda não implementado neste skeleton.",
        promptPreview: buildPromptPreview(prompt),
        safety: getExternalAiStatus().safety
    };
}

export function configureExternalAi(config = {}) {
    externalAiConfig.enabled = Boolean(config.enabled);
    externalAiConfig.provider = config.provider || externalAiConfig.provider;
    externalAiConfig.model = config.model || externalAiConfig.model;
    externalAiConfig.lastError = null;

    return getExternalAiStatus();
}

function buildPromptPreview(prompt) {
    return {
        question: prompt.question,
        systemPrompt: prompt.systemPrompt,
        safetyRules: prompt.safetyRules,
        projectContext: prompt.projectContext,
        runtimeContext: prompt.runtimeContext,
        productionContext: prompt.productionContext,
        roadmapContext: prompt.roadmapContext
    };
}