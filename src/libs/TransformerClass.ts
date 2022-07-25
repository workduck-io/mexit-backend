import { injectable } from 'inversify';

import { ContentNode, ILink } from '../interfaces/Node';
import { NodeResponse } from '../interfaces/Response';
import { NodeMetadata } from '../interfaces/Node';
import { deserializeContent } from './serialize';

interface ILinkNodeMetadata {
  metadata?: { iconUrl?: string };
  updatedAt?: number;
  createdAt?: number;
}
interface LinkHierarchyData {
  hierarchy: string[];
  nodesMetadata: { [nodeID: string]: ILinkNodeMetadata };
}

interface ILinkResponse {
  ilinks: ILink[];
  nodesMetadata: { [nodeID: string]: any };
}

@injectable()
export class Transformer {
  private CACHE_KEY_DELIMITER = '+';
  private LINK_HIERARCHY_DELIMITER = '#';
  private ILINK_DELIMITER = '.';
  private CAPTURES = {
    CONTENT: 'CONTENT',
    LINK: 'LINK',
    NODE: 'NODE',
    SNIPPET: 'SNIPPET',
  };

  linkHierarchyParser = (linkData: LinkHierarchyData): ILinkResponse => {
    const hierarchy = linkData.hierarchy ?? (linkData as unknown as string[]);
    const nodesMetadata = linkData.nodesMetadata;
    const ilinks: ILink[] = [];
    const idPathMapping: { [key: string]: string } = {};

    for (const subTree of hierarchy) {
      const nodes = subTree.split(this.LINK_HIERARCHY_DELIMITER);
      let prefix: string;

      if (nodes.length % 2 !== 0) throw new Error('Invalid Linkdata Input');

      for (let index = 0; index < nodes.length; index += 2) {
        const nodeTitle = nodes[index];
        const nodeID = nodes[index + 1];

        const nodePath = prefix
          ? `${prefix}${this.ILINK_DELIMITER}${nodeTitle}`
          : nodeTitle;

        /*
          Drafts.A and Drafts.B exist, we need to check if the Drafts parent node is the same by checking
          the parent nodeUID. This handles the case in which a nodeID might have two different node paths. 
 
          We still do not handle the case where there are 2 nodes with the same path but different Node IDs,
          we handle that on the frontend for now
        */
        if (idPathMapping[nodeID]) {
          if (idPathMapping[nodeID] !== nodePath)
            throw new Error('Invalid Linkdata Input');
        } else {
          idPathMapping[nodeID] = nodePath;
          ilinks.push({
            nodeid: nodeID,
            path: nodePath,
            icon: nodesMetadata[nodeID]?.metadata?.iconUrl,
            createdAt: nodesMetadata[nodeID]?.createdAt || Infinity,
          });
        }
        prefix = nodePath;
      }
    }
    return { ilinks: ilinks, nodesMetadata: nodesMetadata };
  };

  decodeLinkHierarchy = (linkDatas: string[]): Promise<ILink[]> => {
    return new Promise((resolve, reject) => {
      const iLinks: ILink[] = [];

      linkDatas.map((data, _) => {
        const delimitedStrings = data
          .split(this.LINK_HIERARCHY_DELIMITER)
          .filter(element => element);

        if (delimitedStrings.length % 2 !== 0)
          reject(new Error('Invalid linkdata input'));

        let cumulativePath: string;
        for (let index = 0; index < delimitedStrings.length; ) {
          if (!cumulativePath) cumulativePath = delimitedStrings[index];
          else
            cumulativePath = cumulativePath.concat(
              '.'.concat(delimitedStrings[index])
            );

          iLinks.push({
            nodeid: delimitedStrings[index + 1],
            path: cumulativePath,
          });

          if (index <= delimitedStrings.length) index = index + 2;
          else break;
        }
      });

      resolve(iLinks);
    });
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
    if (
      nodeResponse.id.startsWith(this.CAPTURES.NODE) ||
      nodeResponse.id.startsWith(this.CAPTURES.SNIPPET)
    )
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
      title: nodeResponse.title,
      content: content,
      metadata: metadata,
      ...(nodeResponse.id.startsWith(this.CAPTURES.SNIPPET) && {
        template: nodeResponse.template,
      }),
    };

    return contentResponse;
  };
}
