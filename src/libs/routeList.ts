import path from 'path';
import express from 'express';

interface Options {
  prefix: string;
  spaces: number;
  logger: any;
}

const defaultOptions: Options = {
  prefix: '',
  spaces: 7,
  logger: console.info,
};

export const COLORS = {
  yellow: 33,
  green: 32,
  blue: 34,
  red: 31,
  grey: 90,
  magenta: 35,
  clear: 39,
  brightGreen: 92,
};

const spacer = (x: number) =>
  x > 0 ? [...new Array(x)].map(() => ' ').join('') : '';

export const colorText = (color: number, string: string) =>
  `\u001b[${color}m${string}\u001b[${COLORS.clear}m`;

export const colorMethod = (method: string) => {
  switch (method) {
    case 'POST':
      return colorText(COLORS.yellow, method);
    case 'GET':
      return colorText(COLORS.green, method);
    case 'PUT':
      return colorText(COLORS.blue, method);
    case 'DELETE':
      return colorText(COLORS.red, method);
    case 'PATCH':
      return colorText(COLORS.grey, method);
    default:
      return method;
  }
};

const getPathFromRegex = regex => {
  return regex
    .toString()
    .replace('/^', '')
    .replace('?(?=\\/|$)/i', '')
    .replace(/\\\//g, '/');
};

function expressListRoutes(app: express.Application, opts?: Partial<Options>) {
  const stacks = app._router.stack.reduce((acc, stack) => {
    if (stack.handle.stack) {
      const routerPath = getPathFromRegex(stack.regexp);
      return [
        ...acc,
        ...stack.handle.stack.map(stack => ({ routerPath, ...stack })),
      ];
    }
    return [...acc, stack];
  }, []);

  const options: Options = opts
    ? { ...defaultOptions, ...opts }
    : defaultOptions;

  if (stacks) {
    for (const stack of stacks) {
      if (stack.route) {
        const routeLogged = {};
        for (const route of stack.route.stack) {
          const method = route.method ? route.method.toUpperCase() : null;
          if (!routeLogged[method] && method) {
            const stackMethod = colorMethod(method);
            const stackSpace = spacer(options.spaces - method.length);
            const stackPath = colorText(
              COLORS.brightGreen,
              path.resolve(
                [options.prefix, stack.routerPath, stack.route.path, route.path]
                  .filter(s => !!s)
                  .join('')
              )
            );
            options.logger(stackMethod, stackSpace, stackPath);
            routeLogged[method] = true;
          }
        }
      }
    }
  }
}

export default expressListRoutes;
