import type { TokenPayload, TokenServicePort } from '@modules/auth/domain/ports/token-service.port';

export class FakeTokenService implements TokenServicePort {
  sign(payload: TokenPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  verify(token: string): TokenPayload {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8')) as TokenPayload;
  }
}
