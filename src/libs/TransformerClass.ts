import { injectable } from 'inversify';

import { ContentNode, ILink, NodeMetadata } from '../interfaces/Node';
import { NodeResponse } from '../interfaces/Response';
import { deserializeContent } from './serialize';

interface IconMetadata {
  type: string;
  value: string;
}

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

interface NamespaceInfo {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  itemType: string; // Always going to be 'Namespace'
  nodeHierarchy: string[];
  publicAccess: boolean;
}

interface ILinkWithMetadata extends ILink {
  updatedAt?: number;
  metadata?: { icon?: IconMetadata };
}

interface ParsedNamespaceHierarchy {
  name: string;
  nodeHierarchy: ILinkWithMetadata[];
  namespaceMetadata?: { icon: IconMetadata };
}

type AllNamespaceHierarchyResponse = {
  namespaceInfo: Record<
    string,
    {
      name: string;
      nodeHierarchy: string[];
      namespaceMetadata?: { icon: IconMetadata };
    }
  >;
};

type AllNamespaceHierarchyParserFn = (
  allNamespacesResp: AllNamespaceHierarchyResponse,
  nodesMetadata?: Record<string, { metadata: any; updatedAt: number; createdAt: number }>,
  options?: { withParentNodeId: boolean; allowDuplicates?: boolean }
) => Record<string, ParsedNamespaceHierarchy>;

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

        const nodePath = prefix ? `${prefix}${this.ILINK_DELIMITER}${nodeTitle}` : nodeTitle;

        /*
          Drafts.A and Drafts.B exist, we need to check if the Drafts parent node is the same by checking
          the parent nodeUID. This handles the case in which a nodeID might have two different node paths. 
 
          We still do not handle the case where there are 2 nodes with the same path but different Node IDs,
          we handle that on the frontend for now
        */
        if (idPathMapping[nodeID]) {
          if (idPathMapping[nodeID] !== nodePath) throw new Error('Invalid Linkdata Input');
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

  hierarchyParser = (
    linkData: string[],
    options?: { withParentNodeId: boolean; allowDuplicates?: boolean }
  ): ILink[] => {
    const ilinks: ILink[] = [];
    const idPathMapping: { [key: string]: string } = {};
    const pathIdMapping: { [key: string]: { nodeid: string; index: number } } = {};

    for (const subTree of linkData) {
      const nodes = subTree.split('#');

      let prefix: string | undefined;
      let parentNodeId: string | undefined;

      if (nodes.length % 2 !== 0) throw new Error('Invalid Linkdata Input');

      for (let index = 0; index < nodes.length; index += 2) {
        const nodeTitle = nodes[index];
        const nodeID = nodes[index + 1];

        const nodePath = prefix ? `${prefix}.${nodeTitle}` : nodeTitle;

        /*
              Drafts.A and Drafts.B exist, we need to check if the Drafts parent node is the same by checking
              the parent nodeUID. This handles the case in which a nodeID might have two different node paths. 
     
              We still do not handle the case where there are 2 nodes with the same path but different Node IDs,
              we handle that on the frontend for now
            */

        if (idPathMapping[nodeID]) {
          if (idPathMapping[nodeID] !== nodePath) {
            const ilinkAt = ilinks?.findIndex(ilink => ilink.nodeid === nodeID);

            if (ilinkAt) {
              ilinks.splice(ilinkAt, 1, { ...ilinks[ilinkAt], path: nodePath });
            }
          }
        } else if (pathIdMapping[nodePath] && !options?.allowDuplicates) {
          // mog(`Found existing notePath: ${nodePath} with ${nodeID} at index: ${pathIdMapping[nodePath].index}`)
          ilinks[pathIdMapping[nodePath].index] = {
            nodeid: nodeID,
            path: nodePath,
          };
        } else {
          // mog(`Inserting: ${nodePath} with ${nodeID} at index: ${ilinks.length}`)
          idPathMapping[nodeID] = nodePath;
          pathIdMapping[nodePath] = { nodeid: nodeID, index: ilinks.length };
          const ilink: ILink = { nodeid: nodeID, path: nodePath };
          ilinks.push(options?.withParentNodeId ? { ...ilink, parentNodeId } : ilink);
        }

        prefix = nodePath;
        parentNodeId = nodeID;
      }
    }

    return ilinks;
  };

  decodeLinkHierarchy = (linkDatas: string[]): Promise<ILink[]> => {
    return new Promise((resolve, reject) => {
      const iLinks: ILink[] = [];

      linkDatas.map((data, _) => {
        const delimitedStrings = data.split(this.LINK_HIERARCHY_DELIMITER).filter(element => element);

        if (delimitedStrings.length % 2 !== 0) reject(new Error('Invalid linkdata input'));

        let cumulativePath: string;
        for (let index = 0; index < delimitedStrings.length; ) {
          if (!cumulativePath) cumulativePath = delimitedStrings[index];
          else cumulativePath = cumulativePath.concat('.'.concat(delimitedStrings[index]));

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

  genericNodeConverter = (nodeResponse: NodeResponse, returnData = true) => {
    if (nodeResponse.id.startsWith(this.CAPTURES.NODE) || nodeResponse.id.startsWith(this.CAPTURES.SNIPPET))
      return this.convertNodeToContentFormat(nodeResponse, returnData);
  };
  convertNodeToContentFormat = (nodeResponse: NodeResponse, returnData = true): ContentNode => {
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
      namespaceID: nodeResponse.namespaceID,
      content: returnData ? content : undefined,
      metadata: metadata,
      ...(nodeResponse.id.startsWith(this.CAPTURES.SNIPPET) && {
        template: nodeResponse.template,
      }),
    };

    return contentResponse;
  };

  allNamespacesHierarchyParser: AllNamespaceHierarchyParserFn = (
    allNamespacesResp,
    nodesMetadata?,
    options = { withParentNodeId: false, allowDuplicates: false }
  ) => {
    const parsedNSHierarchy: Record<string, ParsedNamespaceHierarchy> = {};
    Object.entries(allNamespacesResp.namespaceInfo).forEach(([namespaceID, namespaceValue]) => {
      const nHierarchy = this.hierarchyParser(namespaceValue.nodeHierarchy, options);
      parsedNSHierarchy[namespaceID] = {
        name: namespaceValue.name,
        nodeHierarchy: nHierarchy,
        namespaceMetadata: namespaceValue.namespaceMetadata,
      };
    });

    if (nodesMetadata) {
      Object.entries(parsedNSHierarchy).forEach(([namespaceID, namespaceValue]) => {
        namespaceValue.nodeHierarchy = namespaceValue.nodeHierarchy.map(ilink => {
          return {
            ...ilink,
            createdAt: nodesMetadata[ilink.nodeid]?.createdAt || Infinity,
            updatedAt: nodesMetadata[ilink.nodeid]?.updatedAt || Infinity,
            metadata: nodesMetadata[ilink.nodeid]?.metadata || undefined,
          };
        });
      });
    }

    return parsedNSHierarchy;
  };

  namespaceHierarchyParser = (
    namespace: NamespaceInfo,
    options = { withParentNodeId: false, allowDuplicates: false }
  ) => {
    return {
      ...namespace,
      nodeHierarchy: this.hierarchyParser(namespace.nodeHierarchy, options),
    };
  };

  refactoredPathsHierarchyParser = (
    refactorChangedPaths: Record<string, { removedPaths: string[]; addedPaths: string[] }>[],
    options = { withParentNodeId: false, allowDuplicates: false }
  ) => {
    const parsedRefactorChangedPaths: Record<
      string,
      { addedPaths: ILinkWithMetadata[]; removedPaths: ILinkWithMetadata[] }
    > = {};
    refactorChangedPaths.forEach(record => {
      Object.entries(record).forEach(([namespaceID, nsValue]) => {
        parsedRefactorChangedPaths[namespaceID] = {
          addedPaths: this.hierarchyParser(nsValue.addedPaths, options),
          removedPaths: this.hierarchyParser(nsValue.removedPaths, options),
        };
      });
    });
    return parsedRefactorChangedPaths;
  };
}
