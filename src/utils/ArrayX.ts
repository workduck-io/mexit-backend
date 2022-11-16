Object.defineProperty(Array.prototype, 'filterEmpty', {
  value: function () {
    return this.filter(item => item);
  },
});

Object.defineProperty(Array.prototype, 'isEmpty', {
  value: function () {
    return this.length === 0;
  },
});

Object.defineProperty(Array.prototype, 'intersection', {
  value: function (arr) {
    return this.filter(value => arr.includes(value));
  },
});

Object.defineProperty(Array.prototype, 'minus', {
  value: function (arr) {
    return this.filter(value => !arr.includes(value));
  },
});

Object.defineProperty(Array.prototype, 'toObject', {
  value: function ({
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
  },
});

export const parseReviver: (_key, value) => any = (_key, value): any => value; // return everything else unchanged
