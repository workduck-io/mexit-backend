export const IS_DEV = process.env.NODE_ENV === 'production' ? false : true;
export const AWS_REGION = 'us-east-1';
export const STAGE = process.env.STAGE ?? 'staging';

const COGNITO_POOL_ID_MAP = {
  staging: 'us-east-1_Zu7FAh7hj',
  test: 'us-east-1_O5YTlVrCd',
};

const COGNITO_CLIENT_ID_MAP = {
  staging: '6pvqt64p0l2kqkk2qafgdh13qe',
  test: '25qd6eq6vv3906osgv8v3f8c6v',
};

export const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID ?? COGNITO_POOL_ID_MAP[STAGE];

export const COGNITO_CLIENT_ID = process.env.MEXIT_BACKEND_CLIENT_ID ?? COGNITO_CLIENT_ID_MAP[STAGE];

console.log('STARTING WITH STAGE: ', STAGE);
