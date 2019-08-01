const dashify = require('dashify');

function applyKebabCase(path) {
  // eslint-disable-next-line no-param-reassign
  path.node.key = dashify(path.node.key);
}

module.exports = {
  applyKebabCase,
};
