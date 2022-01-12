type Environments = 'dev' | 'prod';

class ConfigClass implements Configuration {
  MEX_BACKEND_URL: string;
  constructor(enviroment: Environments) {
    const config = configurations[enviroment];
    this.MEX_BACKEND_URL = config.MEX_BACKEND_URL;
  }
}

interface Configuration {
  MEX_BACKEND_URL: string;
}

type Configurations = {
  [env in Environments]: Configuration;
};
const configurations: Configurations = {
  dev: {
    MEX_BACKEND_URL: 'http://localhost:4000',
  },
  prod: {
    MEX_BACKEND_URL: 'http://localhost:4000',
  },
};

export const ConfigService = new ConfigClass(
  process.env.NODE_ENV as Environments
);
