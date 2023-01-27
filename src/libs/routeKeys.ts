export const RouteKeys = {
  // Node Operations - CRU, Refactor, bulkCreate
  createNode: 'POST /node',
  getMultipleNode: 'GET /v1/node/ids',
  getNode: 'GET /node/{id}',
  appendNode: 'PATCH /node/{id}/append',
  deleteBlocks: 'PATCH /node/{id}/delete/block',
  refactorHierarchy: 'POST /node/refactor',
  bulkCreateNode: 'POST /node/bulk',
  copyOrMoveBlock: 'PATCH /node/block/movement',
  makeNodePublic: 'PATCH /node/makePublic/{id}',
  makeNodePrivate: 'PATCH /node/makePrivate/{id}',
  updateNodeMetadata: 'PATCH /node/metadata/{id}',

  // Node Archive Operations
  getArchivedNodes: 'GET /node/archive',
  archiveNode: 'PUT /node/archive/middleware',
  unArchiveNode: 'PUT /v1/node/unarchive',
  deleteArchivedNode: 'POST /node/archive/delete',

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

  // Tags Endpoints
  getAllTagsOfWorkspace: 'GET /tag/all',
  getNodeWithTag: 'GET /tag/{tagName}/node',

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

  // Reminders
  getCommentByID: 'GET /{entityId}',
  createComment: 'POST /',
  deleteCommentByID: 'DELETE /{entityId}',
  getAllCommentsOfNode: 'GET /all/{nodeId}',
  getAllCommentsOfBlock: 'GET /all/{nodeId}/block/{blockId}',
  getAllCommentsOfThread: 'GET /all/{nodeId}/block/{blockId}/thread/{threadId}',
  deleteAllCommentsOfNode: 'DELETE /all/{nodeId}',
  deleteAllCommentsOfBlock: 'DELETE /all/{nodeId}/block/{blockId}',
  deleteAllCommentsOfThread:
    'DELETE /all/{nodeId}/block/{blockId}/thread/{threadId}',

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
};
