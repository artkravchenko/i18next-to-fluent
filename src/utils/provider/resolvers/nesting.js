const { ResolutionStatus } = require('../const');

function transformNesting(req, provider) {
  let nextKey = req.key.replace(/\./g, '_');

  if (nextKey === req.key) {
    return null;
  }

  if (provider.bundle.hasMessage(nextKey)) {
    return {
      // FIXME: use `ResolutionStatus.KEY_RESOLVED` instead?
      status: ResolutionStatus.KEY_TRANSFORMED,
      payload: nextKey,
    };
  }

  // replace all "." to "_" except the last one
  // since the last segment is probably an attribute name
  const path = req.key.replace(/\.(?=[^.]*\.)/g, '_');

  let attribute;

  // ignore "prefer-const" eslint rule further
  // since there's no preferable way to declare `attribute` as a constant
  // eslint-disable-next-line prefer-const
  [nextKey, attribute] = path.split('.');

  if (!provider.bundle.hasMessage(nextKey)) {
    return null;
  }

  const msg = provider.bundle.getMessage(nextKey);

  if (
    typeof msg !== 'object' || // message without placeables and attributes
    Array.isArray(msg) || // message with placeables but without attributes
    !('attrs' in msg) || // FIXME: is it needed?
    !(attribute in msg.attrs)
  ) {
    return null;
  }

  return {
    status: ResolutionStatus.KEY_TRANSFORMED,
    payload: { key: nextKey, attribute },
  };
}

module.exports = {
  transformNesting,
};
