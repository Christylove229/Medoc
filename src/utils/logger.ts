const shouldLogInfo = import.meta.env.DEV
  ? import.meta.env.VITE_DEBUG_LOGS !== "false"
  : import.meta.env.VITE_DEBUG_LOGS === "true";

const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const phoneRegex = /\b\d{8,}\b/g;

const sanitizeString = (value: string): string =>
  value
    .replace(emailRegex, "[REDACTED_EMAIL]")
    .replace(phoneRegex, "[REDACTED_NUMBER]");

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value instanceof Error) {
    const sanitized = new Error(sanitizeString(value.message));
    sanitized.name = value.name;
    sanitized.stack = value.stack ? sanitizeString(value.stack) : sanitized.stack;
    return sanitized;
  }

  if (value && typeof value === "object") {
    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObject[key] = sanitizeValue(val);
    }
    return sanitizedObject;
  }

  return value;
};

const sanitizeArgs = (args: unknown[]): unknown[] => args.map((arg) => sanitizeValue(arg));

export const logInfo = (...args: unknown[]) => {
  if (shouldLogInfo) {
    console.info(...sanitizeArgs(args));
  }
};

export const logWarn = (...args: unknown[]) => {
  if (shouldLogInfo) {
    console.warn(...sanitizeArgs(args));
  }
};

export const logError = (...args: unknown[]) => {
  console.error(...sanitizeArgs(args));
};
