const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');

const { getOutputFilename } = require('./filename');

function writeResource(resource, outputOptions) {
  const filename = getOutputFilename(resource, outputOptions);

  mkdirp.sync(path.dirname(filename));
  fs.writeFileSync(filename, resource.text);
}

module.exports = {
  writeResource,
};
