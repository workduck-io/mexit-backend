import { customAlphabet } from 'nanoid';

const nolookalikes = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz';
const nanoid = customAlphabet(nolookalikes, 21);

const generateBlockGUID = () => `BLOCK_${nanoid()}`;
const generateTempGUID = () => `TEMP_${nanoid()}`;

export default {
  generateBlockGUID,
  generateTempGUID,
};
