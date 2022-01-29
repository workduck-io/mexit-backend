import LambdaClient from 'aws-sdk/clients/lambda';

const lambdaClient = new LambdaClient({
  region: 'us-east-1',
});

export default {
  invokeLambdaClient: (params: LambdaClient.InvocationRequest) =>
    lambdaClient.invoke(params).promise(),
};
