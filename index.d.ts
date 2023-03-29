import 'express';

import { LocalsX } from './src/utils/Locals';

declare module 'stats-map';

declare global {
  type KeyModifierFunc<T> = string | ((val: T) => string);
  type ValueModifierFunc<T> = (val: T) => any;
  interface Array<T> extends Array<T> {
    removeLast(): T[];
    toObject(key: KeyModifierFunc<T>, value?: ValueModifierFunc<T>): { [key: string]: any };
    isEmpty(): boolean;
    filterEmpty(): T[];
    minus(arr: T[]): T[];
    intersection(arr: T[]): T[];
  }
}

declare module 'express' {
  export interface Response extends Response {
    locals: LocalsX;
  }
}

export {};
