import { NodeResponse } from '../../interfaces/Response';
import { serializeContent, deserializeContent } from '../../libs/serialize';

describe('Serializer library module', () => {
  describe('Serialize node data', () => {
    it('should return a serialized data', () => {
      const dataToBeSerialized = {
        id: 'NODE_test-user-id',
        type: 'HIERARCHY',
        createdBy: 'testuser@testorg.com',
        nodePath: 'test.doc',
        createNodeUID: 'NODE_test-node',
        lastEditedBy: 'testuser@testorg.com',
        namespaceIdentifier: 'test-namespace',
        workspaceIdentifier: 'test-workspace',
        content: [
          {
            type: 'p',
            createdBy: 'testuser@testorg.com',
            id: 'BLOCK_test-block',
            content: '',
            children: [
              {
                type: 'p',
                id: 'TEMP_test-data',
                metadata: {},
                text: 'hello test',
                italic: true,
              },
            ],
          },
        ],
      };

      const serialisedData = serializeContent(dataToBeSerialized.content)[0];

      expect(serialisedData.children.length).toBeGreaterThan(0);
      expect(serialisedData.elementType).toEqual('p');
      expect(serialisedData.id).toEqual('BLOCK_test-block');
      expect(serialisedData.children[0].id).toEqual('TEMP_test-data');
      expect(serialisedData.children[0].elementType).toEqual('p');
      expect(serialisedData.children[0].content).toEqual('hello test');
      expect(serialisedData.children[0].properties.italic).toBeTruthy();
    });
  });

  describe('Deserialize the node data', () => {
    it('should return the deserialized data', () => {
      const dataToBeDeserialized: NodeResponse = {
        id: 'NODE_test-node',
        title: 'test-title',
        lastEditedBy: 'testuser@testorg.com',
        namespaceID: 'test-namespace',
        workspaceIdentifier: 'test-workspace',
        createdBy: 'testuser@testorg.com',
        createdAt: 83948938,
        updatedAt: 34998390,
        data: [
          {
            content: 'hello test',
            id: 'BLOCK_test-block',
            elementType: 'p',
            children: [
              {
                id: 'TEMP_test-data',
                elementType: 'p',
                content: 'hello test',
                properties: { italic: true },
                parentID: null,
                createdBy: 'testuser@testorg.com',
                lastEditedBy: 'testuser@testorg.com',
                createdAt: 83948938,
                updatedAt: 34998390,
              },
            ],
            parentID: null,
            createdBy: 'testuser@testorg.com',
            lastEditedBy: 'testuser@testorg.com',
            createdAt: 83948938,
            updatedAt: 34998390,
          },
        ],
        itemType: 'test',
        version: 0,
        bookmarked: false,
      };

      const deserialiseData = deserializeContent(dataToBeDeserialized.data)[0];

      expect(deserialiseData.children.length).toBeGreaterThan(0);
      expect(deserialiseData.type).toEqual('p');
      expect(deserialiseData.id).toEqual('BLOCK_test-block');
      expect(deserialiseData.metadata.lastEditedBy).toEqual(
        'testuser@testorg.com'
      );
      expect(deserialiseData.metadata.createdBy).toEqual(
        'testuser@testorg.com'
      );
      expect(deserialiseData.children[0].type).toEqual('p');
      expect(deserialiseData.children[0].id).toEqual('TEMP_test-data');
      expect(deserialiseData.children[0].metadata.lastEditedBy).toEqual(
        'testuser@testorg.com'
      );
      expect(deserialiseData.children[0].metadata.createdBy).toEqual(
        'testuser@testorg.com'
      );
      expect(deserialiseData.children[0].italic).toBeTruthy();
      expect(deserialiseData.children[0].text).toEqual('hello test');
    });
  });
});
