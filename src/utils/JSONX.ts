export class JSONX {
  static parse(parseString: string): any {
    try {
      return JSON.parse(parseString);
    } catch (e) {
      return parseString;
    }
  }
  static stringify(val): string {
    try {
      return JSON.stringify(val);
    } catch (e) {
      return val;
    }
  }
}
