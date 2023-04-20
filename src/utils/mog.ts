import { IS_DEV, STAGE } from '../env';

export const mog = (title: string, propertiesToLog?: Record<string, any>): void => {
  if (STAGE === 'test' || IS_DEV) {
    console.group(title);
    if (propertiesToLog)
      Object.entries(propertiesToLog).forEach(([key, value]) => {
        console.info(`${key}: `, JSON.stringify(value, null, 2));
      });
    console.groupEnd();
  }
};
