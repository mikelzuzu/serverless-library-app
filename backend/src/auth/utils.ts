import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Build Cert from signing key (jwk)
 *
 * @param {string} signingKey which is the key (JWK)
 *
 * @return {string} certificate for verifying the token
 */
export function buildCert(signingKey: string): string {
  let cert = signingKey.match(/.{1,64}/g).join('\n')
  cert = '-----BEGIN CERTIFICATE-----\n' + cert + '\n-----END CERTIFICATE-----';
  return cert
}
