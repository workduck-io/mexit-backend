import { injectable } from 'inversify';
import {
  ClientNode,
  ClientNodeContent,
  ClientNodeContentChildren,
  NodeChildData,
  NodeData,
  NodeDetail,
} from '../interfaces/Node';
import { ContentNodeRequest, LinkNodeRequest } from '../interfaces/Request';
import {
  ContentResponse,
  LinkResponse,
  NodeResponse,
} from '../interfaces/Response';

@injectable()
export class Transformer {
  private BLOCK_ELEMENT_TYPE = 'hyperlink';
  private NODE_ELEMENT_TYPE = 'NodeRequest';
  private NAMESPACE_ID = '#mex-it';
  private DEFAULT_ELEMENT_TYPE = 'p';
  private CACHE_KEY_DELIMITER = '+';
  private CAPTURES = {
    CONTENT: 'CONTENT',
    LINK: 'LINK',
  };

  encodeCacheKey = (...keys: string[]) => {
    let result = '';
    keys.map(key => {
      result += key + this.CACHE_KEY_DELIMITER;
    });
    return result;
  };

  decodeCacheKey = (encodedCacheKey: string) => {
    return encodedCacheKey.split(this.CACHE_KEY_DELIMITER).slice(0, -1);
  };

  genericNodeConverter = (nodeResponse: NodeResponse) => {
    if (nodeResponse.id.startsWith(this.CAPTURES.CONTENT))
      return this.convertNodeToContentFormat(nodeResponse);
    else if (nodeResponse.id.startsWith(this.CAPTURES.LINK))
      return this.convertNodeToLinkFormat(nodeResponse);
  };

  convertClientNodeToNodeFormat = (clientNode: ClientNode) => {
    const nodeData: NodeData[] = [];
    for (const content of clientNode.content) {
      const nodeChildData: NodeChildData[] = [];
      for (const children of content.children) {
        nodeChildData.push({
          id: children.id,
          elementType: children.type ?? this.DEFAULT_ELEMENT_TYPE,
          content: children.text,
          createdBy: clientNode.createdBy,
          properties: {
            ...(children.italic && {
              italic: children.italic,
            }),
            ...(children.bold && {
              bold: children.bold,
            }),
          },
        });
      }
      nodeData.push({
        id: content.id,
        parentID: content.nodeUID,
        elementType: content.type ?? this.DEFAULT_ELEMENT_TYPE,
        children: nodeChildData,
      });
    }

    const nodeDetail: NodeDetail = {
      type: this.NODE_ELEMENT_TYPE,
      id: clientNode.id,
      workspaceIdentifier: clientNode.workspace,
      namespaceIdentifier: this.NAMESPACE_ID,
      data: nodeData,
      lastEditedBy: clientNode.createdBy,
    };

    return nodeDetail;
  };

  convertNodeToClientNodeFormat = (nodeResponse: NodeResponse): ClientNode => {
    const clientNodeContent: ClientNodeContent[] = [];
    for (const nodeDataChildren of nodeResponse.data) {
      const clientNodeContentChildren: ClientNodeContentChildren[] = [];
      for (const nodeBlockChildren of nodeDataChildren.children) {
        clientNodeContentChildren.push({
          id: nodeBlockChildren.id,
          text: nodeBlockChildren.content,
          ...(nodeBlockChildren.properties.bold && {
            bold: nodeBlockChildren.properties.bold,
          }),
          ...(nodeBlockChildren.properties.italic && {
            italic: nodeBlockChildren.properties.italic,
          }),
          type: nodeBlockChildren.elementType,
        });
      }
      clientNodeContent.push({
        id: nodeDataChildren.id,
        nodeUID: nodeDataChildren.parentID,
        children: clientNodeContentChildren,
        type: nodeDataChildren.elementType,
      });
    }

    const clientNodeDetail: ClientNode = {
      id: nodeResponse.id,
      createdBy: nodeResponse.createdBy,
      workspace: nodeResponse.workspaceID,
      content: clientNodeContent,
    };

    return clientNodeDetail;
  };

  convertLinkToNodeFormat = (linkNodeRequest: LinkNodeRequest): NodeDetail => {
    const nodeData: NodeData = {
      id: linkNodeRequest.short,
      elementType: this.BLOCK_ELEMENT_TYPE,
      content: JSON.stringify(linkNodeRequest),
    };
    const nodeDetail: NodeDetail = {
      type: this.NODE_ELEMENT_TYPE,
      id: linkNodeRequest.id,
      workspaceIdentifier: linkNodeRequest.workspace,
      namespaceIdentifier: this.NAMESPACE_ID,
      data: [nodeData],
      lastEditedBy: linkNodeRequest.createdBy,
    };

    return nodeDetail;
  };
  convertContentToNodeFormat = (
    contentNodeRequest: ContentNodeRequest
  ): NodeDetail => {
    const nodeData: NodeData = {
      id: contentNodeRequest.id,
      elementType: this.BLOCK_ELEMENT_TYPE,
      content: JSON.stringify(contentNodeRequest),
    };
    const nodeDetail: NodeDetail = {
      type: this.NODE_ELEMENT_TYPE,
      id: contentNodeRequest.id,
      workspaceIdentifier: contentNodeRequest.workspace,
      namespaceIdentifier: this.NAMESPACE_ID,
      data: [nodeData],
      lastEditedBy: contentNodeRequest.createdBy,
    };

    return nodeDetail;
  };

  convertNodeToLinkFormat = (nodeResponse: NodeResponse): LinkResponse => {
    const linkNodeRequest: LinkNodeRequest = JSON.parse(
      nodeResponse.data[0].content
    );
    const linkResponse: LinkResponse = {
      id: nodeResponse.id,
      createdAt: nodeResponse.createdAt,
      updatedAt: nodeResponse.updatedAt,
      createdBy: nodeResponse.createdBy,
      workspace: nodeResponse.workspaceID,
      namespace: nodeResponse.namespaceID,
      long: linkNodeRequest.long,
      metadata: linkNodeRequest.metadata,
      short: linkNodeRequest.short,
      shortenedURL: linkNodeRequest.shortenedURL,
    };

    return linkResponse;
  };
  convertNodeToContentFormat = (
    nodeResponse: NodeResponse
  ): ContentResponse => {
    const contentNodeRequest: ContentNodeRequest = JSON.parse(
      nodeResponse.data[0].content
    );
    const contentResponse: ContentResponse = {
      id: nodeResponse.id,
      createdAt: nodeResponse.createdAt,
      updatedAt: nodeResponse.updatedAt,
      createdBy: nodeResponse.createdBy,
      workspace: nodeResponse.workspaceID,
      namespace: nodeResponse.namespaceID,
      metadata: contentNodeRequest.metadata,
      content: contentNodeRequest.content,
      range: contentNodeRequest.range,
    };

    return contentResponse;
  };
}
