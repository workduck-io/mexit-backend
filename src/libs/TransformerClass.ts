import { nanoid } from 'nanoid';
import { injectable } from 'inversify';

import {
  ClientNode,
  ClientNodeContent,
  ClientNodeContentChildren,
  NodeChildData,
  NodeData,
  NodeDetail,
  Block,
  ContentNode,
} from '../interfaces/Node';
import { ContentNodeRequest, LinkNodeRequest } from '../interfaces/Request';
import {
  ContentResponse,
  LinkResponse,
  LinkResponseContent,
  NodeResponse,
} from '../interfaces/Response';
import { NodeMetadata } from '../interfaces/Node';
import { deserializeContent } from './serialize';

@injectable()
export class Transformer {
  private BLOCK_ELEMENT_TYPE = 'hyperlink';
  private NODE_ELEMENT_TYPE = 'NodeRequest';
  private BLOCK_REQUEST_TYPE = 'ElementRequest';
  private NAMESPACE_ID = '#mex-it';
  private DEFAULT_ELEMENT_TYPE = 'p';
  private CACHE_KEY_DELIMITER = '+';
  private CAPTURES = {
    CONTENT: 'CONTENT',
    LINK: 'LINK',
    NODE: 'NODE',
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
    if (nodeResponse.id.startsWith(this.CAPTURES.NODE))
      return this.convertNodeToContentFormat(nodeResponse);
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
      workspaceIdentifier: clientNode.workspaceIdentifier,
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
      workspaceIdentifier: nodeResponse.workspaceIdentifier,
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
      workspaceIdentifier: linkNodeRequest.workspaceIdentifier,
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
      path: contentNodeRequest.nodePath,
      workspaceIdentifier: contentNodeRequest.workspaceIdentifier,
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

    const linkContentResponse: LinkResponseContent[] = [];

    linkContentResponse.push({
      id: `BLOCK_${nanoid()}`,
      type: 'h1',
      children: [
        {
          text: linkNodeRequest.short,
        },
      ],
    });
    linkContentResponse.push({
      id: `BLOCK_${nanoid()}`,
      type: this.DEFAULT_ELEMENT_TYPE,
      children: [
        {
          type: 'a',
          children: [
            {
              text: linkNodeRequest.long,
            },
          ],
          url: linkNodeRequest.long,
        },
      ],
    });
    const linkResponse: LinkResponse = {
      id: nodeResponse.id,
      createdAt: nodeResponse.createdAt,
      updatedAt: nodeResponse.updatedAt,
      createdBy: nodeResponse.createdBy,
      workspaceIdentifier: nodeResponse.workspaceIdentifier,
      namespaceIdentifier: nodeResponse.namespaceID,
      long: linkNodeRequest.long,
      metadata: linkNodeRequest.metadata,
      short: linkNodeRequest.short,
      shortenedURL: linkNodeRequest.shortenedURL,
      content: linkContentResponse,
    };

    return linkResponse;
  };
  convertNodeToContentFormat = (nodeResponse: NodeResponse): ContentNode => {
    const content = deserializeContent(nodeResponse.data);
    const metadata: NodeMetadata = {
      createdAt: nodeResponse.createdAt,
      createdBy: nodeResponse.createdBy,
      lastEditedBy: nodeResponse.lastEditedBy,
      userTags: [],
      pageMetaTags: [],
    };

    const contentResponse = {
      id: nodeResponse.id,
      content: content,
      metadata: metadata,
    };

    return contentResponse;
  };
  convertContentToBlockFormat = (contentNodeRequest: ContentNodeRequest) => {
    const blockDetail = {
      type: this.BLOCK_REQUEST_TYPE,
      elements: [contentNodeRequest],
    };
    return blockDetail;
  };
}
