import { NodeDetail } from '../../interfaces/Node';
import container from '../../inversify.config';
import { NodeManager } from '../../managers/NodeManager';

// Increased the timeout for the lambda cold start issue
jest.setTimeout(15000);
describe('Node Manager', () => {
  const nodeManager: NodeManager = container.get<NodeManager>(NodeManager);
  describe('Create a node function', () => {
    it('should create a node and return it as a response', async () => {
      const testNodeDetail: NodeDetail = {
        id: 'NODE_test-user-id',
        namespaceIdentifier: 'test-namespace',
        data: [],
        lastEditedBy: 'testuser@testorg.com',
        type: 'NodeRequest',
      };
      const testNodeResult = await nodeManager.createNode(
        'test-workspace',
        testNodeDetail
      );

      expect(testNodeResult.length).toBeGreaterThan(0);
      expect(JSON.parse(testNodeResult)).toBeTruthy();
    });
  });
  describe('Get node function', () => {
    it('should return corresponding the node for the given node id', async () => {
      const nodeId = 'NODE_test-user-id';
      const node = await nodeManager.getNode(nodeId, 'test-workspace');

      expect(JSON.parse(node)).toBeTruthy();
    });
  });
  describe('Get all nodes function', () => {
    it('should return all the node ids for the given user', async () => {
      const userId = 'WORKSPACE1';
      const allNodes = await nodeManager.getAllNodes(userId, 'test-workspace');

      expect(allNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Append node function', () => {
    it('should return no content with status code 204', async () => {
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
          'test-workspace',
          appendNodeDetail
        )
      );

      expect(appendNodeResult.appendedElements.length).toBeGreaterThan(0);
    });
  });
  describe('Move Block function', () => {
    it('should return no content with status code 204', async () => {
      const blockId = 'BLOCK_test-block';
      const sourceNodeId = 'NODE_test-user-id';

      const testNodeDetail: NodeDetail = {
        id: 'NODE_destination-node',
        namespaceIdentifier: 'test-namespace',
        data: [],
        lastEditedBy: 'testuser@testorg.com',
        type: 'NodeRequest',
      };
      await nodeManager.createNode('test-workspace', testNodeDetail);
      const destinationNodeId = 'NODE_destination-node';

      const movedBlocks = await nodeManager.moveBlocks(
        blockId,
        sourceNodeId,
        destinationNodeId,
        'test-workspace'
      );

      const parsedResult = movedBlocks ? JSON.parse(movedBlocks) : movedBlocks;

      expect(parsedResult).toBeUndefined();
    });
  });

  // unit tests for the failure cases
  describe('Create a node function - Fail Case', () => {
    it('should return undefined as the type is given invalid for the payload', async () => {
      const testNodeDetail: NodeDetail = {
        id: 'NODE_test-user-id',
        namespaceIdentifier: 'test-namespace',
        data: [],
        lastEditedBy: 'testuser@testorg.com',
        type: 'InvalidTypeRequest',
      };
      const testNodeResult = await nodeManager.createNode(
        'test-workspace',
        testNodeDetail
      );

      expect(JSON.parse(testNodeResult).message).toEqual('Error in Input');
    });
  });
  describe('Get node function - Fail Case', () => {
    it('should return undefined for the given node id', async () => {
      const nodeId = 'NODE_does-not-exist';
      const node = await nodeManager.getNode('test-workspace', nodeId);

      expect(node.message).toEqual('Error getting node');
    });
  });
  describe('Get all nodes function - Fail Case 1', () => {
    it('should return empty array for the given user', async () => {
      const userId = 'USER_does-not-exist';
      const allNodes = await nodeManager.getAllNodes(userId, 'test-workspace');

      expect(allNodes.length).toEqual(0);
    });
  });
  describe('Get all nodes function - Fail Case 2', () => {
    it('should return empty array for the invalid user', async () => {
      const userId = 'does-not-exist';
      const allNodes = await nodeManager.getAllNodes(userId, 'test-workspace');

      expect(allNodes.message).toEqual('Invalid ID');
    });
  });
  describe('Append node function - Fail Case', () => {
    it('should return error message when passing invalid node id and payload for append', async () => {
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
          'test-workspace',
          appendNodeDetail
        )
      );

      expect(appendNodeResult.message).not.toBeUndefined();
    });
  });
});
