const { ResolutionStatus } = require('./const');

function getMessageFromBundle(req, args, bundle) {
  const message = bundle.getMessage(req.key);

  let patternToFormat;

  if (req.attribute) {
    patternToFormat = message.attrs[req.attribute];
  } else {
    patternToFormat = message;
  }

  const errors = [];
  const value = bundle.format(patternToFormat, args, errors);

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return value;
}

function isResolutionSkipped(resolverResult) {
  return (
    !resolverResult ||
    resolverResult.status === ResolutionStatus.SKIPPED
  );
}

function createProvider(config) {
  return function getMessage(key, bundle, args) {
    if (bundle.hasMessage(key)) {
      return getMessageFromBundle({ key, attritute: null }, args, bundle);
    }

    let k = key;
    let attribute = null;

    // eslint-disable-next-line no-restricted-syntax
    for (const resolve of config.resolvers) {
      const req = { key: k, attribute, args };
      const res = resolve(req, { bundle });

      if (isResolutionSkipped(res)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      switch (res.status) {
        case ResolutionStatus.KEY_TRANSFORMED: {
          if (typeof res.payload === 'string') {
            k = res.payload;
          } else {
            k = res.payload.key;
            attribute = res.payload.attribute;
          }

          if (bundle.hasMessage(k)) {
            return getMessageFromBundle({ key: k, attribute }, args, bundle);
          }

          // eslint-disable-next-line no-continue
          continue;
        }

        case ResolutionStatus.VALUE_PROVIDED: {
          return res.payload;
        }

        default: {
          throw new Error(
            'getMessage: ' +
            `expected (return value).status of ${resolve.name} resolver ` +
            `to be one of ${JSON.stringify(Object.values(ResolutionStatus))}, ` +
            `but instead got ${JSON.stringify(res.status)}.`,
          );
        }
      }
    }

    throw new Error(
      'getMessage: ' +
      `message with key ${JSON.stringify(key)} has not been found.`,
    );
  };
}

module.exports = {
  createProvider,
  isResolutionSkipped,
};
