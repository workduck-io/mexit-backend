import { InvocationRequest, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

let credentials;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const lambdaClient = new LambdaClient({
  region: 'us-east-1',
  ...(credentials && { credentials: credentials }),
});
export default {
  invokeLambdaClient: async (params: InvocationRequest) => {
    const command = new InvokeCommand(params);
    return await lambdaClient.send(command);
  },
};
