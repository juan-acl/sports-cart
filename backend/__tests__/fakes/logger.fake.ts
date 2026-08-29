import type { LoggerPort } from '@shared/application/ports/logger.port';

export class FakeLogger implements LoggerPort {
  info(_message: string, _meta?: Record<string, unknown>): void {}
  warn(_message: string, _meta?: Record<string, unknown>): void {}
  error(_message: string, _meta?: Record<string, unknown>): void {}
  debug(_message: string, _meta?: Record<string, unknown>): void {}
}
