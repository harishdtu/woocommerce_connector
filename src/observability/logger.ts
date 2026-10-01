export type LogContext = {
  requestId?: string;
  toolName?: string;
  operation?: string;
  durationMs?: number;
  status?: number;
  retryCount?: number;
  category?: string;
};

export function createLogger() {
  return {
    info(context: LogContext, message: string): void {
      console.info(JSON.stringify({ level: 'info', message, ...context }));
    },
    warn(context: LogContext, message: string): void {
      console.warn(JSON.stringify({ level: 'warn', message, ...context }));
    },
    error(context: LogContext, message: string): void {
      console.error(JSON.stringify({ level: 'error', message, ...context }));
    },
  };
}

export const logger = createLogger();
