const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, 'config.json');

const getConfigFromAWS = async () => {
  try {
    if (process.env.GATEWAY_CONFIG) {
      const secret = process.env.GATEWAY_CONFIG;
      fs.writeFileSync(configPath, secret);
    } else {
      const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
      const secret_name = `${process.env.STAGE ?? 'test'}-mexit-backend-api-gateway-tokens`;

      const client = new SecretsManagerClient({
        region: 'us-east-1',
      });

      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
        })
      );

      const secret = response.SecretString;
      fs.writeFileSync(configPath, secret);
    }
  } catch (error) {
    console.log('Error: ', error);
    throw new Error('Could not fetch config.json: ', error);
  }
};

if (!fs.existsSync(configPath)) {
  getConfigFromAWS().then(_ => console.log('Retrieved config.json from AWS Secrets Manager'));
}
