import { promisify } from 'util';
import * as jsonwebtoken from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import got from 'got';

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userEmail: string;
  readonly userId: string;
  readonly eventId: string;
  readonly isValid: boolean;
  readonly error?: any;
}

interface TokenHeader {
  kid: string;
  alg: string;
}
interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}
interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  sub: string;
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  email: string;
  event_id: string;
  username: string;
}

const cognitoPoolId = 'us-east-1_Zu7FAh7hj';
if (!cognitoPoolId) {
  throw new Error('env var required for cognito pool');
}
const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${cognitoPoolId}`;

let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await got.get(url).json<PublicKeys>();
    cacheKeys = publicKeys.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

const TokenHandler = async (
  request: ClaimVerifyRequest
): Promise<ClaimVerifyResult> => {
  let result: ClaimVerifyResult;
  try {
    const token = request.token;
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('requested token is invalid');
    }

    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON) as TokenHeader;
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw new Error('claim made for unknown kid');
    }
    const claim = (await verifyPromised(token, key.pem)) as Claim;
    const currentSeconds = Math.floor(new Date().valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error('claim is expired or invalid');
    }
    if (claim.iss !== cognitoIssuer) {
      throw new Error('claim issuer is invalid');
    }

    if (claim.token_use !== 'id') {
      throw new Error('claim use is not id');
    }

    result = {
      userEmail: claim.email,
      userId: claim.sub,
      eventId: claim.event_id,
      isValid: true,
    };
  } catch (error) {
    result = {
      userEmail: '',
      userId: '',
      eventId: '',
      error: 'Invalid Token',
      isValid: false,
    };
  }
  return result;
};

export { TokenHandler };
