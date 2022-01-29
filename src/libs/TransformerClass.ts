import { injectable } from 'inversify';
import { NodeData, NodeDetail } from '../interfaces/Node';
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
      long: contentNodeRequest.long,
      metadata: contentNodeRequest.metadata,
      content: contentNodeRequest.content,
      range: contentNodeRequest.range,
    };

    return contentResponse;
  };
}
