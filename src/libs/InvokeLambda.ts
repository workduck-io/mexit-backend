import LambdaClient from 'aws-sdk/clients/lambda';

const lambdaClient = new LambdaClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:3002',
  sslEnabled: false,
  apiVersion: '2015-03-31',
  accessKeyId: 'any',
  secretAccessKey: 'any',
});

export default {
  invokeLambdaClient: (params: LambdaClient.InvocationRequest) =>
    lambdaClient.invoke(params).promise(),
};
