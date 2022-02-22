export const RouteKeys = {
  createNode: 'POST /node',
  getAllNodes: `GET /node/all/{id}`,
  getNode: 'GET /node/{id}',
  appendNode: 'POST /node/{id}/append',
  editBlock: 'POST /node/{id}/blockUpdate',
  shorten: 'POST /shorten',
  getShorts: 'GET /{namespace}/stats',
  copyOrMoveBlock: 'PATCH /node/block/movement',
  updateUserPreference: 'POST /user/update',
  createUserPreference: 'POST /user',
  getByIdAndTag: 'GET /user/{id}/{tag}',
  getByGroupIdAndTag: 'GET /user/group/{groupId}/{tag}',
};
