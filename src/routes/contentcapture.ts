import express from 'express';
import { EventClass } from '../libs/EventClass';

const ContentCapture = express.Router();

ContentCapture.post('/', (req, res) => {
  const data = new EventClass(req, 'ContentCaptureDetail');
  res.send(data);
});

ContentCapture.get('/', (req, res) => {
  res.send('get worked wwfe');
});
export default ContentCapture;
