const path = require('path');

const { ResourceTypes } = require('../../const');

function getSubtree(resource) {
  if (resource.type !== ResourceTypes.SUBTREE) {
    throw new Error(
      `Expected resource type to be ${JSON.stringify(ResourceTypes.SUBTREE)} ` +
      'to retrieve "subtree" parameter for the pattern.',
    );
  }

  return resource.name;
}

function resolvePattern(pattern, options) {
  const { parent } = options.resource;

  const variables = {
    get parentext() {
      return path.extname(parent.filename);
    },
    get parentname() {
      const parsed = path.parse(parent.filename);
      return parsed.name;
    },
    get path() {
      return path.dirname(options.resource.parent.filename);
    },
    get subtree() {
      return getSubtree(options.resource);
    },
  };

  const alternatives = Object.keys(variables).join('|');

  return pattern.replace(
    new RegExp(`\\[(${alternatives})\\]`, 'g'),
    (_, name) => variables[name],
  );
}

function getOutputFilename(resource, outputOptions) {
  let filenamePattern;

  if (resource.type === ResourceTypes.RESOURCE) {
    filenamePattern = outputOptions.filename;
  } else if (resource.type === ResourceTypes.SUBTREE) {
    filenamePattern = outputOptions.subtreeFilename;
  } else {
    const supportedResourceTypes = Object
      .values(ResourceTypes)
      .map(type => JSON.stringify(type))
      .join(', ');

    throw new Error(
      `Expected resource type to be one of these: ${supportedResourceTypes}. ` +
      `Instead got: ${JSON.stringify(resource.type)}.`,
    );
  }

  const resolutionOptions = {
    config: outputOptions,
    resource,
  };

  const filename = path.join(
    path.dirname(resource.parent.filename),
    resolvePattern(filenamePattern, resolutionOptions),
  );

  if (!outputOptions.path) {
    return filename;
  }

  const buildDirRelatedFilename = path.relative(
    outputOptions.context,
    filename,
  );

  return path.join(
    outputOptions.path,
    buildDirRelatedFilename,
  );
}

module.exports = {
  getOutputFilename,
};
