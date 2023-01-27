import CommentController from '../controllers/CommentController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeCommentRoutes = (
  commentObject: CommentController
): void => {
  commentObject._router.get(
    `${commentObject._urlPath}/node/:nodeID`,
    [AuthRequest],
    commentObject.getAllCommentsOfNode
  );

  commentObject._router.post(
    `${commentObject._urlPath}`,
    [AuthRequest],
    commentObject.createComment
  );

  commentObject._router.post(
    `${commentObject._urlPath}/node/:nodeID/block/ids`,
    [AuthRequest],
    commentObject.getAllCommentsOfBlocks
  );

  commentObject._router.get(
    `${commentObject._urlPath}/node/:nodeID/block/:blockID`,
    [AuthRequest],
    commentObject.getAllCommentsOfBlock
  );

  commentObject._router.get(
    `${commentObject._urlPath}/node/:nodeID/block/:blockID/thread/:threadID`,
    [AuthRequest],
    commentObject.getAllCommentsOfThread
  );

  commentObject._router.get(
    `${commentObject._urlPath}/:nodeID/:entityID`,
    [AuthRequest],
    commentObject.getComment
  );

  commentObject._router.delete(
    `${commentObject._urlPath}/node/:nodeID`,
    [AuthRequest],
    commentObject.deleteAllCommentsOfNode
  );

  commentObject._router.delete(
    `${commentObject._urlPath}/node/:nodeID/block/:blockID`,
    [AuthRequest],
    commentObject.deleteAllCommentsOfBlock
  );

  commentObject._router.delete(
    `${commentObject._urlPath}/node/:nodeID/block/:blockID/thread/:threadID`,
    [AuthRequest],
    commentObject.deleteAllCommentsOfThread
  );
  commentObject._router.delete(
    `${commentObject._urlPath}/:nodeID/:entityID`,
    [AuthRequest],
    commentObject.deleteComment
  );
};
