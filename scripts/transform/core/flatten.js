const ATTRIBUTE_TYPE = 'Attribute';
const MESSAGE_TYPE = 'Message';

function flatten(messageTree) {
  function iterateFlatten(acc, [key, value]) {
    if (typeof value === 'object' && value !== null) {
      let nextKey;

      if (acc.prefix) {
        nextKey = `${acc.prefix}.${key}`;
      } else {
        nextKey = key;
      }

      const { messages } = Object.entries(value).reduce(
        iterateFlatten,
        { messages: acc.messages, prefix: nextKey },
      );

      return { messages, prefix: acc.prefix };
    }

    if (!acc.prefix) {
      acc.messages.set(key, {
        type: 'Message',
        attributes: [],
        value,
      });

      return acc;
    }

    let parentAttributes;

    if (acc.messages.has(acc.prefix)) {
      parentAttributes = acc.messages.get(acc.prefix).attributes;
    } else {
      parentAttributes = [];
      acc.messages.set(acc.prefix, {
        type: 'Message',
        attributes: parentAttributes,
        value: null,
      });
    }

    parentAttributes.push({ type: 'Attribute', key, value });

    return acc;
  }

  const { messages } = Object.entries(messageTree).reduce(
    iterateFlatten,
    { messages: new Map(), prefix: null },
  );

  return messages;
}

module.exports = {
  ATTRIBUTE_TYPE,
  MESSAGE_TYPE,
  flatten,
};
