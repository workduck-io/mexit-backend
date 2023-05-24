// eslint-disable-next-line
// @ts-ignore
import Config from '../config.json';

import { STAGE } from '../env';

export type Destination = {
  route?: string;
  APIGateway?: keyof typeof Config;
  functionName?: string;
};

export const FunctionNames = {
  Highlight: `mex-backend-${STAGE}-Highlights:latest`,
};

export const RouteKeys = {
  // Ping Endpoint
  Ping: { route: 'GET /ping', APIGateway: 'Node' },

  // Node Endpoints
  // Function name fallback needed for direct lambda invocation
  CreateNode: {
    route: 'POST /v1/node',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  GetNode: {
    route: 'GET /v1/node/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  GetMultipleNodes: {
    route: 'POST /v1/node/ids',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  AppendNode: {
    route: 'PATCH /node/{id}/append',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  DeleteBlocks: {
    route: 'PATCH /v1/node/{id}/delete/block',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  RefactorHierarchy: {
    route: 'POST /node/refactor',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  BulkCreateNode: {
    route: 'POST /node/bulk',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  CopyOrMoveBlock: {
    route: 'PATCH /node/block/movement',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  MakeNodePublic: {
    route: 'PATCH /node/makePublic/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  MakeNodePrivate: {
    route: 'PATCH /node/makePrivate/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  UpdateNodeMetadata: {
    route: 'PATCH /node/metadata/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  GetArchivedNodes: {
    route: 'GET /node/archive',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  ArchiveNode: {
    route: `PUT /node/archive/middleware`,
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  UnarchiveNode: {
    route: `PUT /v1/node/unarchive`,
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },
  DeleteArchivedNode: {
    route: 'POST /node/archive/delete',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Node:latest`,
  },

  // Reminder Endpoints
  GetReminderByID: { route: 'GET /{entityID}', APIGateway: 'Reminder' },
  CreateReminder: { route: 'POST /', APIGateway: 'Reminder' },
  DeleteReminderByID: { route: 'DELETE /{entityID}', APIGateway: 'Reminder' },
  GetAllRemindersOfNode: { route: 'GET /all/node/{nodeID}', APIGateway: 'Reminder' },
  DeleteAllRemindersOfNode: {
    route: 'DELETE /all/node/{nodeID}',
    APIGateway: 'Reminder',
  },
  GetAllRemindersOfWorkspace: { route: 'GET /all/workspace', APIGateway: 'Reminder' },

  // User Ops
  getById: { route: 'GET /{userId}', functionName: `workduck-user-service-${STAGE}-getUser` },
  getByEmail: { route: 'GET /email/{email}', functionName: `workduck-user-service-${STAGE}-getUser` },
  getUser: { route: 'GET /', functionName: `workduck-user-service-${STAGE}-getUser` },
  getUsersOfWorkspace: { route: 'GET /all', functionName: `workduck-user-service-${STAGE}-user` },
  updateUserDetails: { route: 'PUT /info', functionName: `workduck-user-service-${STAGE}-user` },
  updateUserPreference: { route: 'PUT /preference', functionName: `workduck-user-service-${STAGE}-user` },
  getUserByLinkedin: { route: 'POST /linkedin', functionName: `workduck-user-service-${STAGE}-getUser` },
  registerStatus: { route: 'GET /status', functionName: `workduck-user-service-${STAGE}-registerStatus` },
  addExistingUserToWorkspace: { route: 'POST /workspace', functionName: `workduck-user-service-${STAGE}-user` },
  updateActiveWorkspace: { route: 'POST /workspace/active', functionName: `workduck-user-service-${STAGE}-user` },

  //User Invite
  getInvite: { route: 'GET /invite/{inviteId}', functionName: `workduck-user-service-${STAGE}-invite` },
  getAllInviteOfWorkspace: { route: 'GET /invite', functionName: `workduck-user-service-${STAGE}-invite` },
  createInvite: { route: 'POST /invite', functionName: `workduck-user-service-${STAGE}-invite` },
  deleteInvite: { route: 'DELETE /invite/{inviteId}', functionName: `workduck-user-service-${STAGE}-invite` },

  //Workspace Ops
  getAllWorkspaceOfUser: { route: 'GET /workspace/user', functionName: `mex-backend-${STAGE}-Workspace:latest` },
  updateWorkspace: { route: 'PATCH /v1/workspace', functionName: `mex-backend-${STAGE}-Workspace:latest` },
  getWorkspaceByIds: { route: 'GET /v1/workspace/data/{ids}', functionName: `mex-backend-${STAGE}-Workspace:latest` },

  // Share Note Ops
  shareNode: { route: 'POST /shared/node', functionName: `mex-backend-${STAGE}-Node:latest` },
  updateAccessTypeForshareNode: { route: 'PUT /shared/node', functionName: `mex-backend-${STAGE}-Node:latest` },
  revokeNodeAccessForUsers: { route: 'DELETE /shared/node', functionName: `mex-backend-${STAGE}-Node:latest` },
  getNodeSharedWithUser: { route: 'GET /shared/node/{id}', functionName: `mex-backend-${STAGE}-Node:latest` },
  updateSharedNode: { route: 'POST /shared/node/update', functionName: `mex-backend-${STAGE}-Node:latest` },
  getUsersWithNodesShared: { route: 'GET /shared/node/{id}/users', functionName: `mex-backend-${STAGE}-Node:latest` },
  getAllSharedNodeForUser: { route: 'GET /shared/node/all', functionName: `mex-backend-${STAGE}-Node:latest` },

  // Snippet Ops
  getSnippet: { route: 'GET /snippet/{id}', functionName: `mex-backend-${STAGE}-Snippet:latest` },
  getAllVersionsOfSnippet: { route: 'GET /snippet/{id}/all', functionName: `mex-backend-${STAGE}-Snippet:latest` },
  getAllSnippetsOfWorkspace: { route: 'GET /snippet/all', functionName: `mex-backend-${STAGE}-Snippet:latest` },
  createSnippet: { route: 'POST /snippet', functionName: `mex-backend-${STAGE}-Snippet:latest` },
  makeSnippetPublic: {
    route: 'PATCH /snippet/makePublic/{id}/{version}',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },
  makeSnippetPrivate: {
    route: 'PATCH /snippet/makePrivate/{id}/{version}',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },
  clonePublicSnippet: {
    route: 'POST /snippet/clone/{id}/{version}',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },
  deleteVersionOfSnippet: { route: 'DELETE /snippet/{id}', functionName: `mex-backend-${STAGE}-Snippet:latest` },
  deleteAllVersionsOfSnippet: {
    route: 'DELETE /snippet/{id}/all',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },
  updateSnippetMetadata: {
    route: 'PATCH /v1/snippet/metadata/{id}',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },

  // Bookmark Ops
  createBookmark: { route: 'POST /userStar/{id}', functionName: `mex-backend-${STAGE}-UserStar:latest` },
  removeBookmark: { route: 'DELETE /userStar/{id}', functionName: `mex-backend-${STAGE}-UserStar:latest` },
  getAllBookmarks: { route: 'GET /userStar/all', functionName: `mex-backend-${STAGE}-UserStar:latest` },
  batchCreateBookmark: { route: 'POST /userStar/batch', functionName: `mex-backend-${STAGE}-UserStar:latest` },
  batchRemoveBookmark: { route: 'DELETE /userStar/batch', functionName: `mex-backend-${STAGE}-UserStar:latest` },

  // Namespace Ops
  createNamespace: {
    route: 'POST /namespace',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
    APIGateway: 'Node',
  },
  getNamespace: {
    route: 'GET /namespace/{id}',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
    APIGateway: 'Node',
  },
  updateNamespace: {
    route: 'PATCH /namespace',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
    APIGateway: 'Node',
  },
  makeNamespacePublic: {
    route: 'PATCH /namespace/makePublic/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },
  makeNamespacePrivate: {
    route: 'PATCH /namespace/makePrivate/{id}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },
  getAllNamespaceHierarchy: {
    route: 'GET /namespace/all/hierarchy',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },
  getAllNamespaces: {
    route: 'GET /v2/namespace/all',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
    APIGateway: 'Node',
  },
  getNodeIDFromPath: {
    route: 'GET /namespace/{namespaceID}/path/{path}',
    APIGateway: 'Node',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },
  deleteNamespace: {
    route: 'POST /namespace/{id}',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
    APIGateway: 'Node',
  },

  // View Ops
  getAllViews: { route: 'GET /view/all/workspace', functionName: `task-${STAGE}-view` },
  getView: { route: 'GET /view/{entityId}', functionName: `task-${STAGE}-view` },
  deleteView: { route: 'DELETE /view/{entityId}', functionName: `task-${STAGE}-view` },
  saveView: { route: 'POST /view', functionName: `task-${STAGE}-view` },

  // Public Namespace, Node and Snippet Ops
  getPublicNode: { route: 'GET /node/public/{id}', functionName: `mex-backend-${STAGE}-Node:latest` },
  getPublicNamespace: { route: 'GET /namespace/public/{id}', functionName: `mex-backend-${STAGE}-Namespace:latest` },
  getPublicSnippet: {
    route: 'GET /snippet/public/{id}/{version}',
    functionName: `mex-backend-${STAGE}-Snippet:latest`,
  },

  // Share Namespace Ops
  shareNamespace: { route: 'POST /shared/namespace', functionName: `mex-backend-${STAGE}-Namespace:latest` },
  revokeUserAccessFromNamespace: {
    route: 'DELETE /shared/namespace',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },
  getUsersOfSharedNamespace: {
    route: 'GET /shared/namespace/{id}/users',
    functionName: `mex-backend-${STAGE}-Namespace:latest`,
  },

  // Comments Ops
  getCommentByID: { route: 'GET /{nodeId}/{entityId}', functionName: `comment-${STAGE}-main` },
  createComment: { route: 'POST /', functionName: `comment-${STAGE}-main` },
  deleteCommentByID: { route: 'DELETE /{nodeId}/{entityId}', functionName: `comment-${STAGE}-main` },
  getAllCommentsOfNode: { route: 'GET /all/{nodeId}', functionName: `comment-${STAGE}-main` },
  getAllCommentsOfBlock: { route: 'GET /all/{nodeId}/block/{blockId}', functionName: `comment-${STAGE}-main` },
  getAllCommentsOfThread: {
    route: 'GET /all/{nodeId}/block/{blockId}/thread/{threadId}',
    functionName: `comment-${STAGE}-main`,
  },
  deleteAllCommentsOfNode: { route: 'DELETE /all/{nodeId}', functionName: `comment-${STAGE}-main` },
  deleteAllCommentsOfBlock: { route: 'DELETE /all/{nodeId}/block/{blockId}', functionName: `comment-${STAGE}-main` },
  deleteAllCommentsOfThread: {
    route: 'DELETE /all/{nodeId}/block/{blockId}/thread/{threadId}',
    functionName: `comment-${STAGE}-main`,
  },

  // Reaction Ops
  getAllReactionsOfNode: { route: 'GET /node/{nodeId}', functionName: `reaction-${STAGE}-main` },
  getAllReactionsOfBlock: { route: 'GET /node/{nodeId}/block/{blockId}', functionName: `reaction-${STAGE}-main` },
  getReactionDetailsOfBlock: {
    route: 'GET /node/{nodeId}/block/{blockId}/details',
    functionName: `reaction-${STAGE}-main`,
  },
  toggleReaction: { route: 'POST /', functionName: `reaction-${STAGE}-main` },

  // Smart Capture Ops
  getPublicCaptureConfig: { route: 'GET /config/all/public', functionName: `smartcapture-${STAGE}-config` },

  // Highlight Ops
  getHighlightByID: { route: 'GET /{entityId}', functionName: `highlights-${STAGE}-main` },
  createHighlight: { route: 'POST /', functionName: `highlights-${STAGE}-main` },
  deleteHighlightByID: { route: 'DELETE /{entityId}', functionName: `highlights-${STAGE}-main` },
  getHighlightByIDs: { route: 'GET /multiple', functionName: `highlights-${STAGE}-main` },
  getAllHighlightsOfWorkspace: { route: 'GET /all', functionName: `highlights-${STAGE}-main` },

  // Mex Loch Ops
  getAllServices: { route: 'GET /connect/all', functionName: `mex-loch-${STAGE}-allConfig` },
  getConnectedServices: { route: 'GET /connect', functionName: `mex-loch-${STAGE}-connected` },
  connectToService: { route: 'POST /connect', functionName: `mex-loch-${STAGE}-register` },
  updateParentNodeOfService: { route: 'PUT /connect', functionName: `mex-loch-${STAGE}-update` },

  // Actions Ops
  getActionsOfActionGroup: {
    route: 'GET /{actionGroupId}/helpers',
    functionName: `actionHelperService-${STAGE}-getAllActionGroups`,
  },
  getAction: {
    route: 'GET /{actionGroupId}/helpers/{actionId}',
    functionName: `actionHelperService-${STAGE}-getAction`,
  },
  createUserAuth: { route: 'GET /verifyUser/{source}', functionName: `authService-${STAGE}-createUserAuth` },
  getAuth: { route: 'GET /{authTypeId}', functionName: `authService-${STAGE}-getAuth` },
  getAllAuths: { route: 'GET /all', functionName: `authService-${STAGE}-getAllAuths` },
  updateAuth: { route: 'PUT /current/{authTypeId}', functionName: `authService-${STAGE}-updateCurrentWorkspace` },
  refreshAuth: { route: 'POST /refresh/{source}', functionName: `authService-${STAGE}-refreshWorkspaceAuth` },

  // Prompt Ops
  getAllPrompts: { route: 'GET /allUser', functionName: `gpt3Prompt-${STAGE}-main` },
  chatWithGPT: { route: 'POST /chat', functionName: `gpt3Prompt-${STAGE}-main` },
  generatePromptResult: { route: 'POST /result/{id}', functionName: `gpt3Prompt-${STAGE}-main` },
  getUserAuthInfo: { route: 'GET /userAuth', functionName: `gpt3Prompt-${STAGE}-main` },
  updateUserAuthInfo: { route: 'POST /userAuth', functionName: `gpt3Prompt-${STAGE}-main` },
  getAllPromptProviders: { route: 'GET /providers', functionName: `gpt3Prompt-${STAGE}-main` },

  // Link Ops
  shortenLink: { functionName: `mex-url-shortner-${STAGE}-shorten` },
  getAllShortsOfWorkspace: { functionName: `mex-url-shortner-${STAGE}-workspaceDetails` },
  deleteShort: { functionName: `mex-url-shortner-${STAGE}-del` },
  getStatsByURL: { functionName: `mex-url-shortner-${STAGE}-stats` },

  createSmartCapture: { functionName: `mex-backend-${STAGE}-SmartCapture:latest`, route: 'POST /v1/capture' },
  updateCapture: { functionName: `mex-backend-${STAGE}-SmartCapture:latest`, route: 'PUT /v1/capture/{id}' },
  getCapture: { functionName: `mex-backend-${STAGE}-SmartCapture:latest`, route: 'GET /v1/capture/{id}' },
  deleteCapture: { functionName: `mex-backend-${STAGE}-SmartCapture:latest`, route: 'DELETE /v1/capture/{id}' },
  filterAllCaptures: { functionName: `mex-backend-${STAGE}-SmartCapture:latest`, route: 'GET /v1/capture/filter' },

  CreateHighlight: { functionName: FunctionNames.Highlight, route: 'POST /v1/highlight' },
  GetHighlight: { functionName: FunctionNames.Highlight, route: 'GET /v1/highlight/{id}' },
  GetAllHighlightInstances: {
    functionName: FunctionNames.Highlight,
    route: 'GET /v1/highlight/instances/all/{id}',
  },
  GetHighlightsByIds: {
    functionName: FunctionNames.Highlight,
    route: 'POST /v1/highlight/ids',
  },
  UpdateHighlight: { functionName: FunctionNames.Highlight, route: 'PUT /v1/highlight/{id}' },
  DeleteHighlight: { functionName: FunctionNames.Highlight, route: 'DELETE /v1/highlight/{id}' },
  GetAllHighlightsOfWorkspace: {
    functionName: FunctionNames.Highlight,
    route: 'GET /v1/highlight/all',
  },
} satisfies Record<string, Destination>;
