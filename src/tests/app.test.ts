// eslint-disable-next-line node/no-unpublished-import
import axios from 'axios';
import { AuthManager } from '../managers/AuthManager';
import { authFreshRequestData, authFreshResponseData } from './mockvalues';
import container from '../inversify.config';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test the Auth Service', () => {
  test('POST /api/<version>/auth', async () => {
    mockAxios.post.mockResolvedValue({
      data: [authFreshResponseData],
    });
    const authManager: AuthManager = container.get<AuthManager>(AuthManager);
    const mockedResult = await authManager.performAuthWithAWS(
      authFreshRequestData
    );
    expect(mockedResult).toEqual(authFreshResponseData);
  });
});
