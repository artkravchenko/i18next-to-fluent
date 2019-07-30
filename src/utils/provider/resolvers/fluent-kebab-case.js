const kebabCase = require('kebab-case');

const { ResolutionStatus } = require('../const');

/*
  // alternative ways to implement custom resolvers:

  const resolve = (key, api, next) => {
    next({
      status: ResolutionStatus.KEY_TRANSFORMED,
      payload: doSomething(key),
    });
  };

  const resolve = config => provider => next => (req: { key, options }) => {
    // measure time

    const result = next({
      status: ResolutionStatus.KEY_TRANSFORMED,
      payload: doSomething(req.key),
    });

    // measure the total time of resolution (`next(...)` chain)
    // `result` is what was finally resolved or provided
  };

  const resolve = (req, provider) => {
    const nextKey = f(req);

    // helper for { status: ResolutionStatus.KEY_TRANSFORMED, payload: nextKey }
    return provider.status.keyTransfomed(nextKey)
  };
*/
function transformToFluentKebabCase(req) {
  let nextKey = kebabCase(req.key);

  if (nextKey[0] === '-') {
    nextKey = `_${nextKey.slice(1)}`;
  }

  if (nextKey === req.key) {
    return null;
  }

  return {
    status: ResolutionStatus.KEY_TRANSFORMED,
    payload: nextKey,
  };
}

module.exports = {
  transformToFluentKebabCase,
};
