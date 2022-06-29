import { customAlphabet } from 'nanoid';

const nolookalikes = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz';
const nanoid = customAlphabet(nolookalikes, 21);
const shortId = customAlphabet(nolookalikes, 5);

const generateBlockGUID = () => `BLOCK_${nanoid()}`;
const generateTempGUID = () => `TEMP_${shortId()}`;
const generateNodeGUID = () => `NODE_${nanoid()}`;

export default {
  generateBlockGUID,
  generateTempGUID,
  generateNodeGUID,
};
