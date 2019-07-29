const { ResolutionStatus } = require('./const');

function getMessageFromBundle(key, args, bundle) {
  const message = bundle.getMessage(key);
  const errors = [];
  const value = bundle.format(message, args, errors);

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return value;
}

function createProvider(config) {
  return function getMessage(key, bundle, args) {
    if (bundle.hasMessage(key)) {
      return getMessageFromBundle(key, args, bundle);
    }

    let k = key;

    // eslint-disable-next-line no-restricted-syntax
    for (const resolve of config.resolvers) {
      const res = resolve({ key: k, args }, { bundle });

      if (!res) {
        // eslint-disable-next-line no-continue
        continue;
      }

      switch (res.status) {
        case ResolutionStatus.SKIPPED: {
          // eslint-disable-next-line no-continue
          continue;
        }

        case ResolutionStatus.KEY_TRANSFORMED: {
          k = res.payload;

          if (bundle.hasMessage(k)) {
            return getMessageFromBundle(k, args, bundle);
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
};
