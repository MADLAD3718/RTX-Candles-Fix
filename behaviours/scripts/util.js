/**
 * Removes the namespace portion of a typeId.
 * @param {string} typeId The specified typeId.
 * @returns {string} The typeId with the namespace removed.
 */
export function withoutNamespace(typeId) {
    return typeId.substring(typeId.indexOf(':') + 1);
}