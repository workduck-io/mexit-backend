// const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, 'config.json');

const getConfigFromAWS = () => {
  try {
    const secret = process.env.GATEWAY_CONFIG
    fs.writeFileSync(configPath, secret);
  } catch (error) {
    throw new Error('Could not fetch config.json: ', error);
  }
};

if (!fs.existsSync(configPath)) {
  getConfigFromAWS()
  console.log('Retrieved config.json from AWS Secrets Manager')
}
