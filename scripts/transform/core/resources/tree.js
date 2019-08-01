const { ResourceTypes } = require('../const');
const { traverse } = require('../traverse');
const { FALLBACK_PREFIX } = require('./const');
const { splitMessagesIntoSubtrees } = require('./subtrees');
const { transformDotsInKeys } = require('./transformers/dots-in-keys');
const { serialize } = require('./transformers/serialization');

function getResourceTree(messages, options) {
  let resourceTree;

  if (options.config.splitTopLevelSubtrees) {
    resourceTree = splitMessagesIntoSubtrees(messages);
  } else {
    const resourceMessages = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of messages.entries()) {
      resourceMessages.push({ key, ...value });
    }

    resourceTree = new Map();
    resourceTree.set(FALLBACK_PREFIX, { messages: resourceMessages });
  }

  const ftlResources = traverse(resourceTree, {
    visitors: [
      transformDotsInKeys,
      serialize,
    ],
  });

  if (!options.config.splitTopLevelSubtrees) {
    const commonResource = ftlResources.get(FALLBACK_PREFIX);

    return [
      {
        type: ResourceTypes.RESOURCE,
        text: commonResource.text,
        parent: options.parentResource,
      },
    ];
  }

  return [...ftlResources.entries()]
    .map(([resourceName, resource]) => ({
      type: ResourceTypes.SUBTREE,
      name: resourceName,
      text: resource.text,
      parent: options.parentResource,
    }));
}

module.exports = {
  getResourceTree,
};
