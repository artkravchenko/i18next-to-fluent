#!/usr/bin/env node
const fs = require('fs');

const { parseOptions } = require('./transform/cli/options');
const { transformResource } = require('./transform/core');
const { writeResource } = require('./transform/core/resources/output');

const options = parseOptions(process.argv.slice(2));

options.cli.entries.forEach((filename) => {
  const text = fs.readFileSync(filename, 'utf-8');

  const messages = JSON.parse(text);
  const resource = { filename, messages };
  const outputResources = transformResource(resource, options.core.transform);

  outputResources.forEach(r => writeResource(r, options.core.output));
});
