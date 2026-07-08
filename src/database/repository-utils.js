export function toSnakeCase(value) {
    return String(value)
        .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase(value) {
    return String(value)
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function objectToSnakeCase(data = {}) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            toSnakeCase(key),
            value
        ])
    );
}

export function objectToCamelCase(data = {}) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            toCamelCase(key),
            value
        ])
    );
}

export function rowsToCamelCase(rows = []) {
    return rows.map((row) => objectToCamelCase(row));
}

export function removeUndefined(data = {}) {
    return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    );
}