const { ATTRIBUTE_TYPE, MESSAGE_TYPE } = require('../../flatten');

function transformKey(key) {
  return key.replace(/\./g, '_');
}

function transformDotsInKeys(path) {
  if (!path.node.value) {
    return;
  }

  const { type } = path.node.value;

  if (!type) {
    return;
  }

  let attributes;

  if (type === MESSAGE_TYPE) {
    // eslint-disable-next-line no-param-reassign
    path.node.value.key = transformKey(path.node.value.key);
    ({ attributes } = path.node.value);
  } else if (type === ATTRIBUTE_TYPE) {
    attributes = [path.node.value];
  }

  attributes.forEach((a) => {
    // eslint-disable-next-line no-param-reassign
    a.key = transformKey(a.key);
  });

  // eslint-disable-next-line no-param-reassign
  path.shouldSkip = true;
}

module.exports = {
  transformDotsInKeys,
};
