export const ensureArray = <T>(arr: T | T[]): T[] => (Array.isArray(arr) ? arr : arr != null ? [arr] : [])
