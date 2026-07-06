import fs from "fs";
import path from "path";

const STORE_PATH = path.resolve("sessions/instance-company-bindings.json");

function ensureStoreFile() {
    const dir = path.dirname(STORE_PATH);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(STORE_PATH)) {
        fs.writeFileSync(STORE_PATH, JSON.stringify({}, null, 4));
    }
}

export function readInstanceCompanyBindings() {
    ensureStoreFile();

    const raw = fs.readFileSync(STORE_PATH, "utf-8");

    return JSON.parse(raw || "{}");
}

export function writeInstanceCompanyBindings(data = {}) {
    ensureStoreFile();

    fs.writeFileSync(
        STORE_PATH,
        JSON.stringify(data, null, 4)
    );

    return data;
}

export function setInstanceCompanyBinding(instanceId, companyId) {
    const bindings = readInstanceCompanyBindings();

    bindings[instanceId] = companyId;

    writeInstanceCompanyBindings(bindings);

    return {
        instanceId,
        companyId
    };
}

export function getInstanceCompanyBindingFromStore(instanceId) {
    const bindings = readInstanceCompanyBindings();

    return bindings[instanceId] || null;
}

export function listInstanceCompanyBindingsFromStore() {
    const bindings = readInstanceCompanyBindings();

    return Object.entries(bindings).map(([instanceId, companyId]) => ({
        instanceId,
        companyId
    }));
}