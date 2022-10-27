import ReactionController from '../controllers/ReactionController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializeReactionRoutes = (
  reactionObject: ReactionController
): void => {
  reactionObject._router.get(
    `${reactionObject._urlPath}/node/:nodeID/block/:blockID`,
    [AuthRequest],
    reactionObject.getReactionsOfBlock
  );

  reactionObject._router.get(
    `${reactionObject._urlPath}/node/:nodeID`,
    [AuthRequest],
    reactionObject.getReactionsOfNode
  );

  reactionObject._router.get(
    `${reactionObject._urlPath}/node/:nodeID/block/:blockID/details`,
    [AuthRequest],
    reactionObject.getReactionDetailsOfBlock
  );

  reactionObject._router.post(
    `${reactionObject._urlPath}`,
    [AuthRequest],
    reactionObject.toggleReaction
  );
};
