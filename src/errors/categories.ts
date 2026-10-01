export type ErrorCategory =
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export type ConnectorErrorPayload = {
  category: ErrorCategory;
  message: string;
  statusCode?: number;
  retryable: boolean;
};

export class ConnectorError extends Error {
  category: ErrorCategory;
  statusCode?: number;
  retryable: boolean;

  constructor(payload: ConnectorErrorPayload) {
    super(payload.message);
    this.name = 'ConnectorError';
    this.category = payload.category;
    this.statusCode = payload.statusCode;
    this.retryable = payload.retryable;
  }
}
