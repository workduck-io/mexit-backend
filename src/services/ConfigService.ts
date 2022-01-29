type Environments = 'local' | 'dev' | 'staging' | 'prod';

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
  local: {
    MEX_BACKEND_URL: 'http://localhost:4000',
  },
  dev: {
    MEX_BACKEND_URL: 'https://nefphny834.execute-api.us-east-1.amazonaws.com',
  },
  staging: {
    MEX_BACKEND_URL: 'https://qp5qf0k5sg.execute-api.us-east-1.amazonaws.com',
  },
  prod: {
    MEX_BACKEND_URL: 'https://qp5qf0k5sg.execute-api.us-east-1.amazonaws.com',
  },
};

export const ConfigService = new ConfigClass(
  process.env.NODE_ENV as Environments
);
