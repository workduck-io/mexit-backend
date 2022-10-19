import {
  LambdaClient,
  InvocationRequest,
  InvokeCommand,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({
  region: 'us-east-1',
  // endpoint: 'http://localhost:3002',
  // sslEnabled: false,
  // apiVersion: '2015-03-31',
  // accessKeyId: 'any',
  // secretAccessKey: 'any',
});

export default {
  invokeLambdaClient: async (params: InvocationRequest) => {
    const command = new InvokeCommand(params);
    return await lambdaClient.send(command);
  },
};
