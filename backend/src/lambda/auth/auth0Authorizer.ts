import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { buildCert } from '../../auth/utils'

const logger = createLogger('auth')

// to verify JWT token signature get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

const jwksUrl = process.env.JWKS_URL

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', { authorizationToken:event.authorizationToken} )
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.debug('User was authorized', { jwtToken:jwtToken })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  //Check the algorithm in the token
  if (jwt.header.alg != 'RS256') throw new Error('Not supported algorithm for the token')

  //get the jwks
  const jwks = await getKeySet()
  //get the key that we need
  const signingKey = getSigningKey(jwt.header.kid, jwks)
  const cert = buildCert(signingKey.x5c[0])

  // Information on how to verify the token : https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getKeySet() {
  const response = await Axios.get(jwksUrl)

  return response.data.keys
}

function getSigningKey(kid: string, keySet) {
  return keySet.find(key => key.kid === kid)
}

