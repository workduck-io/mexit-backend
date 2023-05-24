import OAuth2Controller from '../controllers/OAuth2Controller';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeOAuth2Routes = (oAuth2Object: OAuth2Controller): void => {
  oAuth2Object._router.post(`${oAuth2Object._urlPath}/persist`, [AuthRequest], oAuth2Object.persistAuth);
  oAuth2Object._router.get(
    `${oAuth2Object._urlPath}/getGoogleAccessToken`,
    [AuthRequest],
    oAuth2Object.getNewAccessToken
  );
  oAuth2Object._router.get(
    `${oAuth2Object._urlPath}/getGoogleAuthUrl`,
    [AuthRequest],
    oAuth2Object.getGoogleCalendarScopeAuth
  );
  oAuth2Object._router.get(`${oAuth2Object._urlPath}/google`, [], oAuth2Object.extractTokenFromCode);
};
