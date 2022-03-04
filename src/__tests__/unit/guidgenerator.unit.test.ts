import GuidGenerator from '../../libs/GuidGenerator';

describe('GuidGenerator library module', () => {
  describe('Generate Block GUID', () => {
    it("should return a string identifier that has a prefix of BLOCK_ and a random string without '-'", () => {
      const blockGuid = GuidGenerator.generateBlockGUID();

      expect(blockGuid.startsWith('BLOCK_')).toBeTruthy();
      expect(blockGuid.includes('-')).toBeFalsy();
    });
  });
  describe('Generate Temp GUID', () => {
    it("should return a string identifier that has a prefix of TEMP_ and a random string without '-'", () => {
      const tempGuid = GuidGenerator.generateTempGUID();

      expect(tempGuid.startsWith('TEMP_')).toBeTruthy();
      expect(tempGuid.includes('-')).toBeFalsy();
    });
  });
});
