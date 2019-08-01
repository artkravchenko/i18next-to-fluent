function shouldSkip(path) {
  return (
    path.shouldSkip ||
    (path.parentPath && shouldSkip(path.parentPath))
  );
}

function getEntriesArray(x) {
  if ('entries' in x && typeof x.entries === 'function') {
    return [...x.entries()];
  }

  return Object.entries(x);
}

function getEmptyInstance(x) {
  return new x.constructor();
}

function append(target, property, value) {
  if (Array.isArray(target)) {
    target.push(value);
  } else if (target instanceof Map) {
    target.set(property, value);
  } else if (target instanceof Set) {
    target.add(value);
  } else {
    // eslint-disable-next-line no-param-reassign
    target[property] = value;
  }
}

function traverseTree(tree, callback, ctx, depth = 0) {
  if (tree == null) {
    return tree;
  }

  const entriesArray = getEntriesArray(tree);

  return entriesArray.reduce(
    (acc, entry) => {
      const phrase = {
        key: entry[0],
        value: entry[1],
      };

      const path = {
        node: phrase,
        parentPath: null,
        shouldSkip: false,
      };

      const parentNodeValue = new Proxy(tree, {
        set(target, property, value) {
          // eslint-disable-next-line no-param-reassign
          target[property] = value;
          // eslint-disable-next-line no-param-reassign
          acc[property] = value;

          if (path.node && property === path.node.key) {
            path.node = null;
          }

          return true;
        },
        deleteProperty(target, property) {
          // eslint-disable-next-line no-param-reassign
          delete target[property];
          // eslint-disable-next-line no-param-reassign
          delete acc[property];

          if (path.node && property === path.node.key) {
            path.node = null;
          }

          return true;
        },
      });

      const parentPath = {
        node: { value: parentNodeValue },
        parentPath: null,
        shouldSkip: false,
      };

      path.parentPath = parentPath;

      callback(path, { ...ctx, depth });

      if (!path.node) {
        return acc;
      }

      let { value: nextValue } = path.node;

      if (typeof nextValue === 'undefined') {
        return acc;
      }

      if (
        !shouldSkip(path) &&
        typeof nextValue === 'object' &&
        nextValue !== null
      ) {
        nextValue = traverseTree(nextValue, callback, ctx, depth + 1);
      }

      append(acc, path.node.key, nextValue);

      return acc;
    },
    getEmptyInstance(tree),
  );
}

function traverse(object, options) {
  return options.visitors.reduce(
    (acc, visitor) => traverseTree(acc, visitor, { state: new Map() }),
    object,
  );
}

module.exports = {
  traverse,
};
