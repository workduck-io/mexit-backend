export type GenericType =
  | string
  | number
  | boolean
  | GenericObjectType
  | Array<GenericType>;

export type GenericObjectType = { [x: string]: GenericType };
