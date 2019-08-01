const { flatten } = require('./flatten');
const { getResourceTree } = require('./resources/tree');
const { wrapJSON } = require('./transformers/wrap-json');
// const { applyKebabCase } = require('./transformers/kebab-case');
const { transformPlurals } = require('./transformers/plurals');
const { transformInterpolation } = require('./transformers/interpolation');
const { traverse } = require('./traverse');

function transformResource(resource, options) {
  const messageTree = traverse(resource.messages, {
    visitors: [
      wrapJSON,
      // applyKebabCase,
      transformPlurals,
      transformInterpolation,
    ],
  });

  const messages = flatten(messageTree);

  const resources = getResourceTree(messages, {
    config: options,
    parentResource: resource,
  });

  return resources;
}

module.exports = {
  transformResource,
};
