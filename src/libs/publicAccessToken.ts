import got from 'got';
import { COGNITO_CLIENT_ID } from '../env';

export interface PublicAccessCreds {
  idToken?: string;
  accessToken?: string;
  refreshToken: string;
  expiry?: number;
}

const REFRESH_TOKEN = process.env.MEX_DEFAULT_USER_REFRESH_TOKEN;
export const initialPublicCreds = (): PublicAccessCreds => {
  return { refreshToken: REFRESH_TOKEN };
};

export const refreshAccessCreds = async (
  refreshToken: string
): Promise<PublicAccessCreds> => {
  const URL = 'https://workduck.auth.us-east-1.amazoncognito.com/oauth2/token';

  const response = (await got
    .post(URL, {
      form: {
        grant_type: 'refresh_token',
        client_id: COGNITO_CLIENT_ID,
        refresh_token: REFRESH_TOKEN,
      },
    })
    .json()) as any;

  return {
    idToken: `Bearer ${response.id_token}`,
    accessToken: `Bearer ${response.access_token}`,
    refreshToken: refreshToken,
    expiry: Date.now() + response.expires_in * 1000,
  };
};
