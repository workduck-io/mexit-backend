import GuidGenerator from '../libs/GuidGenerator';
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
}
