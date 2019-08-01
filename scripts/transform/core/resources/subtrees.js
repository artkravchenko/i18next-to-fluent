const { FALLBACK_PREFIX } = require('./const');

function getPrefix(key) {
  const match = key.match(/^([^.]+)\./);

  if (match === null) {
    return null;
  }

  return match[1];
}

function splitMessagesIntoSubtrees(messages) {
  const skippedMessages = [];

  const resourceTree = [...messages.entries()].reduce(
    (resources, [key, value]) => {
      const prefix = getPrefix(key);

      if (!prefix) {
        skippedMessages.push({ key, ...value });
        return resources;
      }

      let resourceMessages;

      if (resources.has(prefix)) {
        ({ messages: resourceMessages } = resources.get(prefix));
      } else {
        resourceMessages = [];
        resources.set(prefix, { messages: resourceMessages });
      }

      resourceMessages.push({ key, ...value });

      return resources;
    },
    new Map(),
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const message of skippedMessages) {
    let resourceMessages;
    let resourceName = FALLBACK_PREFIX;

    if (resourceTree.has(message.key)) {
      ({ messages: resourceMessages } = resourceTree.get(message.key));
      resourceName = message.key;
    } else if (resourceTree.has(FALLBACK_PREFIX)) {
      ({ messages: resourceMessages } = resourceTree.get(FALLBACK_PREFIX));
    } else {
      resourceMessages = [];
      resourceTree.set(FALLBACK_PREFIX, { messages: resourceMessages });
    }

    if (resourceName === FALLBACK_PREFIX) {
      resourceMessages.push(message);
    } else {
      resourceMessages.unshift(message);
    }
  }

  return resourceTree;
}

module.exports = {
  splitMessagesIntoSubtrees,
};
