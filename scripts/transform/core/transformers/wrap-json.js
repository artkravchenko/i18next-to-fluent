/* eslint-disable prefer-template */
function wrapJSON(path) {
  if (!Array.isArray(path.node.value)) {
    return;
  }

  // eslint-disable-next-line no-param-reassign
  path.node.value = (
    '```json\n' +
    JSON.stringify(path.node.value) + '\n' +
    '```'
  );
}

module.exports = {
  wrapJSON,
};
