import { NodeDetail } from '../../interfaces/Node';
import container from '../../inversify.config';
import { NodeManager } from '../../managers/NodeManager';
import got from 'got';
import 'dotenv/config';
// eslint-disable-next-line

const WORKSPACE_ID = process.env.MEXIT_BACKEND_WORKSPACE_ID;
const REFRESH_TOKEN = process.env.MEXIT_BACKEND_REFRESH_TOKEN;
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

      expect(testNodeResult.length).toBeGreaterThan(0);
      expect(JSON.parse(testNodeResult)).toBeTruthy();
    });
  });
  describe('Get node function', () => {
    it('should return corresponding the node for the given node id', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.getNode(nodeId, WORKSPACE_ID, ID_TOKEN);

      expect(JSON.parse(node)).toBeTruthy();
    });
  });
  describe('Get node function - Fail Case', () => {
    it('should return undefined for the given node id', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_does-not-exist';
      const node = await nodeManager.getNode(nodeId, WORKSPACE_ID, ID_TOKEN);

      expect(node.message).toContain('Error');
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
  describe('Append node function', () => {
    it('should return no content with status code 204', async () => {
      const ID_TOKEN = await getIdToken();
      const appendNodeDetail = {
        type: 'ElementRequest',
        elements: [
          {
            createdBy: 'test-user-id',
            id: 'BLOCK_test',
            content: 'Sample Content 4',
            elementType: 'list',
            children: [
              {
                elementType: 'paragraph',
                id: 'test-child-id',
                content: 'test child content',
              },
            ],
          },
        ],
      };

      const appendNodeResult = JSON.parse(
        await nodeManager.appendNode(
          'NODE_test-user-id',
          WORKSPACE_ID,
          ID_TOKEN,
          appendNodeDetail
        )
      );

      expect(appendNodeResult.appendedElements.length).toBeGreaterThan(0);
    });
  });
  describe('Create a node function - Fail Case', () => {
    it('should return undefined as the type is given invalid for the payload', async () => {
      const ID_TOKEN = await getIdToken();
      const testNodeDetail: NodeDetail = {
        id: 'NODE_test-user-id',
        title: 'test-title',
        namespaceIdentifier: 'test-namespace',
        data: [],
        type: 'InvalidTypeRequest',
      };
      const testNodeResult = await nodeManager.createNode(
        WORKSPACE_ID,
        ID_TOKEN,
        testNodeDetail
      );

      expect(JSON.parse(testNodeResult).message).toContain('Malformed Request');
    });
  });

  describe('Append node function - Fail Case', () => {
    it('should return error message when passing invalid node id and payload for append', async () => {
      const ID_TOKEN = await getIdToken();
      const appendNodeDetail = {
        type: 'ElementRequest',
        elements: [
          {
            id: 'BLOCK_test',
            children: [{ id: 'sampleChildID' }],
            createdBy: 'test-user',
          },
        ],
      };
      const appendNodeResult = JSON.parse(
        await nodeManager.appendNode(
          'NODE_invalid-node-id',
          WORKSPACE_ID,
          ID_TOKEN,
          appendNodeDetail
        )
      );

      expect(appendNodeResult.message).not.toBeUndefined();
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
      expect(JSON.parse(node.body)).toBe(nodeId);
    });
  });
  describe('Get public node by UID', () => {
    it('should return the corresponding public node for the given node id', async () => {
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.getPublicNode(nodeId);

      expect(JSON.parse(node).id).toBe(nodeId);
      expect(JSON.parse(node).data.length).toBeGreaterThan(0);
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
      expect(JSON.parse(node.body)).toBe(nodeId);
    });
  });
  describe('Get node by UID - Fail Case', () => {
    it('should fail since the given node UID was made private', async () => {
      const ID_TOKEN = await getIdToken();
      const nodeId = 'NODE_FAILPUBLICNODE';
      const node = await nodeManager.getPublicNode(nodeId);

      expect(JSON.parse(node).message).toBe('Requested Resource Not Found');
    });
  });
});
