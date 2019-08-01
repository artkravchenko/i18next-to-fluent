/**
 * Transforms i18next variable references into Fluent ones
 * ```
 * "{{count}}ml of {{juice}}" -> "{ $count }ml of { $juice }"
 * ```
 * TODO: support member expressions e.g. `{{object.property}}`
 * @param {*} path
 */
function transformInterpolation(path) {
  if (typeof path.node.value !== 'string') {
    return;
  }

  // eslint-disable-next-line no-param-reassign
  path.node.value = path.node.value.replace(
    /\{\{([^}\s]+)\}\}/g,
    '{ $$$1 }',
  );
}

module.exports = {
  transformInterpolation,
};
