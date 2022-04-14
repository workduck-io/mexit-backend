import container from '../../inversify.config';
import { Transformer } from '../../libs/TransformerClass';

describe('Transformer Module', () => {
  const transformer: Transformer = container.get<Transformer>(Transformer);
  describe('Decode link hierarchy to ILink format', () => {
    it('should return the decoded nodeId and the corresponding node path', async () => {
      const linkHierarchy = ['A#Aid#B#Bid#C#Cid', 'F#Fid', 'R#Rid#Q#Qid'];
      const iLinks = await transformer.decodeLinkHierarchy(linkHierarchy);

      expect(iLinks.length).toEqual(6);
      // Assert the nodeId
      expect(iLinks[0].nodeId).toEqual('Aid');
      expect(iLinks[1].nodeId).toEqual('Bid');
      expect(iLinks[2].nodeId).toEqual('Cid');
      expect(iLinks[3].nodeId).toEqual('Fid');
      expect(iLinks[4].nodeId).toEqual('Rid');
      expect(iLinks[5].nodeId).toEqual('Qid');
      // Assert the node path
      expect(iLinks[0].path).toEqual('A');
      expect(iLinks[1].path).toEqual('A.B');
      expect(iLinks[2].path).toEqual('A.B.C');
      expect(iLinks[3].path).toEqual('F');
      expect(iLinks[4].path).toEqual('R');
      expect(iLinks[5].path).toEqual('R.Q');
    });
  });

  describe('Decode link hierarchy to ILink format - Fail Case', () => {
    it('should return the decoded nodeId and the corresponding node path', async () => {
      const linkHierarchy = ['A#Aid#B#Bid#C#Cid', 'F#Fid', 'R#Rid#Q#Qid', 'C#'];
      expect(
        async () => await transformer.decodeLinkHierarchy(linkHierarchy)
      ).rejects.toThrow('Invalid linkdata input');
    });
  });
});
