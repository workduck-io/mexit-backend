interface APIGatewayConfig {
  url: string;
  token: string;
}

const Config = {
  Node: {
    url: 'https://77956pfj9b.execute-api.us-east-1.amazonaws.com/test',
    token: process.env.REST_API_KEY,
  },
  Reminder: {
    url: '',
    token: '',
  },
} satisfies Record<string, APIGatewayConfig>;

export default Config;
