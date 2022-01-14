export interface AuthorizeType {
  email: string;
  password: string;
}

export interface AuthorizeRefreshTokenType {
  refreshToken: string;
  email: string;
}
