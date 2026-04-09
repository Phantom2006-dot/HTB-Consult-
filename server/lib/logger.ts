const levels = { info: "INFO", warn: "WARN", error: "ERROR", debug: "DEBUG" } as const;

function timestamp() {
  return new Date().toISOString();
}

function log(level: keyof typeof levels, message: string, meta?: Record<string, unknown>) {
  const line = meta
    ? `[${timestamp()}] ${levels[level]} ${message} ${JSON.stringify(meta)}`
    : `[${timestamp()}] ${levels[level]} ${message}`;
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
};
