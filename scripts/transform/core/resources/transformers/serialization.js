/**
 * TODO: use `FluentSerializer` from "fluent-syntax" npm package
 * @param {*} path
 */
function serialize(path) {
  if (path.node.key !== 'messages') {
    return;
  }

  const messages = path.node.value.map((message) => {
    let messageText = `${message.key} =`;

    if (typeof message.value === 'string') {
      messageText += ` ${message.value}`;
    } else {
      const attrs = message.attributes.map(
        attr => `  .${attr.key} = ${attr.value}`,
      );

      messageText += `\n${attrs.join('\n')}`;
    }

    return messageText;
  });

  // eslint-disable-next-line no-param-reassign
  path.node.value = `${messages.join('\n\n')}\n`;
  // eslint-disable-next-line no-param-reassign
  path.node.key = 'text';
}

module.exports = {
  serialize,
};
