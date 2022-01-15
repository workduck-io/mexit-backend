// eslint-disable-next-line node/no-unpublished-import
import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  moduleFileExtensions: ['ts'],
  clearMocks: true,
};
export default config;
