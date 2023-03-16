import { Destination } from '../interfaces/Request';

export const RouteKeys = {
  // User Ops
  getById: 'GET /{userId}',
  getByEmail: 'GET /email/{email}',
  getUser: 'GET /',
  getUsersOfWorkspace: 'GET /all',
  updateUserDetails: 'PUT /info',
  updateUserPreference: 'PUT /preference',
  createUserPreference: 'POST ',
  getUserByLinkedin: 'POST /linkedin',
  registerStatus: 'GET /status',
  //User Invite
  getInvite: 'GET /invite/{inviteId}',
  getAllInviteOfWorkspace: 'GET /invite',
  createInvite: 'POST /invite',
  deleteInvite: 'DELETE /invite/{inviteId}',

  // Shared Note Ops
  shareNode: 'POST /shared/node',
  updateAccessTypeForshareNode: 'PUT /shared/node',
  revokeNodeAccessForUsers: 'DELETE /shared/node',
  getNodeSharedWithUser: 'GET /shared/node/{nodeID}',
  updateSharedNode: 'POST /shared/node/update',
  getUsersWithNodesShared: 'GET /shared/node/{id}/users',
  getAllSharedNodeForUser: 'GET /shared/node/all',

  // Snippet Ops
  getSnippet: 'GET /snippet/{id}',
  getAllVersionsOfSnippet: 'GET /snippet/{id}/all',
  getAllSnippetsOfWorkspace: 'GET /snippet/all',
  createSnippet: 'POST /snippet',
  makeSnippetPublic: 'PATCH /snippet/makePublic/{id}/{version}',
  makeSnippetPrivate: 'PATCH /snippet/makePrivate/{id}/{version}',
  clonePublicSnippet: 'POST /snippet/clone/{id}/{version}',
  deleteVersionOfSnippet: 'DELETE /snippet/{id}',
  deleteAllVersionsOfSnippet: 'DELETE /snippet/{id}/all',
  updateSnippetMetadata: 'PATCH /v1/snippet/metadata/{id}',

  // User Star (Bookmark) Endpoints
  createBookmark: 'POST /userStar/{id}',
  removeBookmark: 'DELETE /userStar/{id}',
  getAllBookmarks: 'GET /userStar/all',
  batchCreateBookmark: 'POST /userStar/batch',
  batchRemoveBookmark: 'DELETE /userStar/batch',

  // Namespace Ops - CRUD, Fetch Hierarchy
  createNamespace: 'POST /namespace',
  getNamespace: 'GET /namespace/{id}',
  updateNamespace: 'PATCH /namespace',
  makeNamespacePublic: 'PATCH /namespace/makePublic/{id}',
  makeNamespacePrivate: 'PATCH /namespace/makePrivate/{id}',
  getAllNamespaceHierarchy: 'GET /namespace/all/hierarchy',
  getAllNamespaces: 'GET /v2/namespace/all',
  getNodeIDFromPath: 'GET /namespace/{namespaceID}/path/{path}',
  deleteNamespace: 'POST /namespace/{id}',

  // Views - CRUD Operations
  getAllViews: 'GET /view/all/workspace',
  getView: 'GET /view/{entityId}',
  deleteView: 'DELETE /view/{entityId}',
  saveView: 'POST /view',

  // Public Namespace, Node and Snippet Ops
  getPublicNode: 'GET /node/public/{id}',
  getPublicNamespace: 'GET /namespace/public/{id}',
  getPublicSnippet: 'GET /snippet/public/{id}/{version}',

  // Shared Namespaces Roues
  shareNamespace: 'POST /shared/namespace',
  revokeUserAccessFromNamespace: 'DELETE /shared/namespace',
  getUsersOfSharedNamespace: 'GET /shared/namespace/{id}/users',

  // Reminders
  getReminderByID: 'GET /{entityId}',
  createReminder: 'POST /',
  deleteReminderByID: 'DELETE /{entityId}',
  getAllRemindersOfNode: 'GET /all/node/{nodeId}',
  deleteAllRemindersOfNode: 'DELETE /all/node/{nodeId}',
  getAllRemindersOfWorkspace: 'GET /all/workspace',

  // Comments
  getCommentByID: 'GET /{nodeId}/{entityId}',
  createComment: 'POST /',
  deleteCommentByID: 'DELETE /{nodeId}/{entityId}',
  getAllCommentsOfNode: 'GET /all/{nodeId}',
  getAllCommentsOfBlock: 'GET /all/{nodeId}/block/{blockId}',
  getAllCommentsOfThread: 'GET /all/{nodeId}/block/{blockId}/thread/{threadId}',
  deleteAllCommentsOfNode: 'DELETE /all/{nodeId}',
  deleteAllCommentsOfBlock: 'DELETE /all/{nodeId}/block/{blockId}',
  deleteAllCommentsOfThread: 'DELETE /all/{nodeId}/block/{blockId}/thread/{threadId}',

  // Reactions - CRUD Operations
  getAllReactionsOfNode: 'GET /node/{nodeId}',
  getAllReactionsOfBlock: 'GET /node/{nodeId}/block/{blockId}',
  getReactionDetailsOfBlock: 'GET /node/{nodeId}/block/{blockId}/details',
  toggleReaction: 'POST /',

  //SmartCapture
  getPublicCaptureConfig: 'GET /config/all/public',

  //Highlights
  getHighlightByID: 'GET /{entityId}',
  createHighlight: 'POST /',
  deleteHighlightByID: 'DELETE /{entityId}',
  getHighlightByIDs: 'GET /multiple',
  getAllHighlightsOfWorkspace: 'GET /all',

  // Mex Loch
  getAllServices: 'GET /connect/all',
  getConnectedServices: 'GET /connect',
  connectToService: 'POST /connect',
  updateParentNodeOfService: 'PUT /connect',

  //Actions
  getActionsOfActionGroup: 'GET /{actionGroupId}/helpers',
  getAction: 'GET /{actionGroupId}/helpers/{actionId}',

  //Action Auth
  getAuth: 'GET /{authTypeId}',
  getAllAuths: 'GET /all',
  updateAuth: 'PUT /current/{authTypeId}',
  refreshAuth: 'PUT /refresh/{source}',

  // Prompt
  getAllPrompts: 'GET /allUser',
  generatePromptResult: 'POST /result/{id}',
  getUserAuthInfo: 'GET /userAuth',
  updateUserAuthInfo: 'POST /userAuth',
  getAllPromptProviders: 'GET /providers',
};

export const APIGatewayRouteKeys = {
  // Ping Endpoint
  Ping: { route: '/ping', method: 'GET', APIGateway: 'Node' },

  // Node Endpoints
  CreateNode: { route: '/v1/node', method: 'POST', APIGateway: 'Node' },
  GetNode: { route: (nodeID: string) => `/v1/node/${nodeID}`, method: 'GET', APIGateway: 'Node' },
  GetMultipleNodes: { route: '/v1/node/ids', method: 'POST', APIGateway: 'Node' },
  AppendNode: { route: (nodeID: string) => `/node/${nodeID}/append`, method: 'PATCH', APIGateway: 'Node' },
  DeleteBlocks: { route: (nodeID: string) => `/v1/node/${nodeID}`, method: 'GET', APIGateway: 'Node' },
  RefactorHierarchy: { route: `/node/refactor`, method: 'POST', APIGateway: 'Node' },
  BulkCreateNode: { route: `/node/bulk`, method: 'POST', APIGateway: 'Node' },
  CopyOrMoveBlock: {
    route: `/node/block/movement`,
    method: 'PATCH',
    APIGateway: 'Node',
  },
  MakeNodePublic: { route: (nodeID: string) => `/node/makePublic/${nodeID}`, method: 'PATCH', APIGateway: 'Node' },
  MakeNodePrivate: { route: (nodeID: string) => `/node/makePrivate/${nodeID}`, method: 'PATCH', APIGateway: 'Node' },
  UpdateNodeMetadata: { route: (nodeID: string) => `/node/metadata/${nodeID}`, method: 'PATCH', APIGateway: 'Node' },
  GetArchivedNodes: { route: `/node/archive`, method: 'GET', APIGateway: 'Node' },
  ArchiveNode: { route: `/node/archive/middleware`, method: 'PUT', APIGateway: 'Node' },
  UnarchiveNode: { route: `/v1/node/unarchive`, method: 'PUT', APIGateway: 'Node' },
  DeleteArchivedNode: { route: `/node/archive/delete`, method: 'POST', APIGateway: 'Node' },

  // Reminder Endpoints
  GetReminderByID: { route: (entityID: string) => `/${entityID}`, method: 'GET', APIGateway: 'Reminder' },
  CreateReminder: { route: '/', method: 'POST', APIGateway: 'Reminder' },
  DeleteReminderByID: { route: (entityID: string) => `/${entityID}`, method: 'DELETE', APIGateway: 'Reminder' },
  GetAllRemindersOfNode: { route: (nodeID: string) => `/all/node/${nodeID}`, method: 'GET', APIGateway: 'Reminder' },
  DeleteAllRemindersOfNode: {
    route: (nodeID: string) => `/all/node/${nodeID}`,
    method: 'DELETE',
    APIGateway: 'Reminder',
  },
  GetAllRemindersOfWorkspace: { route: `/all/workspace`, method: 'GET', APIGateway: 'Reminder' },
} satisfies Record<string, Destination>;
