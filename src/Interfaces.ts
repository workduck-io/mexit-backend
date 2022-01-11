import { ContentCaptureDetail } from './interfaces/ContentCapture';
import schema from './types.json';

type SchemaType = typeof schema.definitions;
type Definitions = { [x in keyof SchemaType]: Object };
export default class Interfaces implements Definitions {
  ContentCaptureDetail: ContentCaptureDetail;
}
