import express from 'express';
import { RequestClass } from '../libs/RequestClass';

const ContentCapture = express.Router();

ContentCapture.post('/', (req, res) => {
  const data = new RequestClass(req, 'ContentCaptureDetail');
  res.send(data);
});

ContentCapture.get('/', (req, res) => {
  res.send('get worked wwfe');
});
export default ContentCapture;
