const isLoggingEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === "true";

export const logInfo = (...args: unknown[]) => {
  if (isLoggingEnabled) {
    console.info(...args);
  }
};

export const logWarn = (...args: unknown[]) => {
  if (isLoggingEnabled) {
    console.warn(...args);
  }
};

export const logError = (...args: unknown[]) => {
  if (isLoggingEnabled) {
    console.error(...args);
  }
};
