const ResolutionStatus = {
  SKIPPED: 'SKIPPED',

  // TODO: OPTIONS_TRANSFORMED (?)
  // TODO: REQUEST_TRANSFORMED (?)
  KEY_TRANSFORMED: 'KEY_TRANSFORMED',

  KEY_RESOLVED: 'KEY_RESOLVED',

  // Very useful in the cases when resolver needs to provide message's value
  // instead of just resolving the key to it - the message has to be dynamic
  // to support i18next-style requests of objects rather than strings.
  // In Fluent, there's no actual message in the bundle for that "subtree"
  // so the resolver has to dynamically create one based on requested key.
  VALUE_PROVIDED: 'VALUE_PROVIDED',
};

module.exports = {
  ResolutionStatus,
};
