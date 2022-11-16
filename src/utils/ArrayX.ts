export class ArrayX<T> extends Array<T> {
  filter<S extends T>(
    predicate: (value: T, index: number, array: T[]) => value is S
  ): ArrayX<S>;
  filter(predicate: unknown): ArrayX<T>;
  filter(
    predicate: (value: T, index: number, array: T[]) => unknown
  ): ArrayX<T> {
    const resultArray = new ArrayX<T>();
    for (let index = 0; index < this.length; index++) {
      if (predicate(this[index], index, this)) resultArray.push(this[index]);
    }
    return resultArray;
  }
  filterEmpty(): ArrayX<T> {
    return this.filter((item: T) => item);
  }
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U): ArrayX<U> {
    const resultArray = new ArrayX<U>();
    for (let index = 0; index < this.length; index++) {
      resultArray.push(callbackfn(this[index], index, this));
    }
    return resultArray;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }
  intersection(arr: T[]): ArrayX<T> {
    return this.filter((value: T) => arr.includes(value));
  }
  minus(arr: T[]): ArrayX<T> {
    return this.filter((value: T) => !arr.includes(value));
  }
  toObject({
    key,
    value = item => item,
  }: {
    key: string | ((a) => string);
    value?: (item: any) => any;
  }): any {
    return this.reduce((acc, val) => {
      return {
        ...acc,
        [typeof key === 'string' ? val[key] : key(val)]: value(val),
      };
    }, {});
  }
}

export const parseReviver: (_key, value) => any = (_key, value): any =>
  Array.isArray(value) ? new ArrayX(...value) : value; // return everything else unchanged
