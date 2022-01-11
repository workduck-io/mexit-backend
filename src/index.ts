import express from 'express';
import { jsonErrorHandler } from './libs/helpers';
import ContentCapture from './routes/contentcapture';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/contentcapture', ContentCapture);

app.use(jsonErrorHandler);
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
