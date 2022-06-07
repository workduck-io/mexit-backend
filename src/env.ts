export const IS_DEV = process.env.NODE_ENV === 'production' ? false : true;
export const AWS_REGION = 'us-east-1';
export const STAGE = process.env.STAGE ?? 'test';
