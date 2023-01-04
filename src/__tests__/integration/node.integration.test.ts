import 'reflect-metadata';
import { NodeDetail } from '../../interfaces/Node';
import container from '../../inversify.config';
import { NodeManager } from '../../managers/NodeManager';
import got from 'got';
import 'dotenv/config';
// eslint-disable-next-line

const WORKSPACE_ID = process.env.MEXIT_BACKEND_WORKSPACE_ID;
const REFRESH_TOKEN = process.env.MEX_DEFAULT_USER_REFRESH_TOKEN;
const CLIENT_ID = process.env.MEXIT_BACKEND_CLIENT_ID;

if (!(WORKSPACE_ID && REFRESH_TOKEN && CLIENT_ID)) {
  throw new Error('Env Variables not supplied');
}

const getIdToken = async () => {
  const URL = 'https://workduck.auth.us-east-1.amazoncognito.com/oauth2/token';
  const ID_TOKEN = (
    (await got
      .post(URL, {
        form: {
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          refresh_token: REFRESH_TOKEN,
        },
      })
      .json()) as any
  ).id_token;
  return `Bearer ${ID_TOKEN}`;
};

// Increased the timeout for the lambda cold start issue
jest.setTimeout(15000);
describe('Node Manager', () => {
  const nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  describe('Create a node function', () => {
    it('should create a node and return it as a response', async () => {
      const ID_TOKEN = await getIdToken();
      const testNodeDetail: NodeDetail = {
        id: 'NODE_test-user-id',
        title: 'test-title',
        namespaceIdentifier: 'test-namespace',
        data: [],
        type: 'NodeRequest',
      };

      const testNodeResult = await nodeManager.createNode(
        WORKSPACE_ID,
        ID_TOKEN,
        testNodeDetail
      );

      expect(testNodeResult.id).toEqual('NODE_test-user-id');
    });
  });
  describe('Get node function', () => {
    it('should return corresponding the node for the given node id', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.getNode(nodeId, WORKSPACE_ID, ID_TOKEN);
      expect(node.id).toEqual('NODE_test-user-id');
    });
  });
  describe('Get node function - Fail Case', () => {
    it('should return undefined for the given node id', async () => {
      try {
        const ID_TOKEN = await getIdToken();
        const nodeId = 'NODE_does-not-exist';
        await nodeManager.getNode(nodeId, WORKSPACE_ID, ID_TOKEN);
      } catch (error) {
        expect(error.response.statusCode).toBeGreaterThanOrEqual(400);
      }
    });
  });
  describe('Get all nodes function - Fail Case 1', () => {
    it('should return empty array for the given user', async () => {
      const ID_TOKEN = await getIdToken();
      const userId = 'USER_does-not-exist';
      const allNodes = await nodeManager.getAllNodes(
        userId,
        WORKSPACE_ID,
        ID_TOKEN
      );

      expect(allNodes.length).toEqual(0);
    });
  });
  describe('Create a node function - Fail Case', () => {
    it('should return undefined as the type is given invalid for the payload', async () => {
      try {
        const ID_TOKEN = await getIdToken();
        const testNodeDetail = {
          id: 'NODE_test-user-id',
          namespaceIdentifier: 'test-namespace',
          data: [],
        };
        await nodeManager.createNode(WORKSPACE_ID, ID_TOKEN, testNodeDetail);
      } catch (error) {
        expect(error.response.statusCode).toEqual(400);
        expect(error.response.message).toEqual('Malformed Request');
      }
    });
  });

  describe('Make Node Public by UID', () => {
    it('make the node by given UID public', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.makeNodePublic(
        nodeId,
        WORKSPACE_ID,
        ID_TOKEN
      );
      expect(node).toBe(nodeId);
    });
  });
  describe('Get public node by UID', () => {
    it('should return the corresponding public node for the given node id', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.getPublicNode(nodeId, ID_TOKEN);
      expect(node.id).toBe(nodeId);
      expect(node.data.length).toBeGreaterThanOrEqual(0);
    });
  });
  describe('Make Node Private by UID', () => {
    it('make the node by given UID private', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.makeNodePrivate(
        nodeId,
        WORKSPACE_ID,
        ID_TOKEN
      );
      expect(node).toBe(nodeId);
    });
  });
  describe('Get node by UID - Fail Case', () => {
    it('should fail since the given node UID was made private', async () => {
      try {
        const ID_TOKEN = await getIdToken();
        const nodeId = 'NODE_FAILPUBLICNODE';
        await nodeManager.getPublicNode(nodeId, ID_TOKEN);
      } catch (error) {
        expect(error.response.statusCode).toEqual(404);
      }
    });
  });
});
