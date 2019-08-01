const path = require('path');

const glob = require('glob');
const yargs = require('yargs/yargs');

const OptionNames = {
  OUT_FILE: 'out-file',
  OUT_DIR: 'out-dir',
  OUT_RELATIVE_DIR: 'out-relative-dir',
  SPLIT_TOP_LEVEL_SUBTREES: 'split-top-level-subtrees',
};

function getAbsolutePath(str) {
  if (!str) {
    return null;
  }

  if (path.isAbsolute(str)) {
    return str;
  }

  return path.resolve(str);
}

/**
 * TODO: return unique paths
 * @param {*} parsedArgv
 */
function getCLIEntries(parsedArgv) {
  return parsedArgv._.reduce((acc, arg) => {
    const filenames = glob.sync(arg, { absolute: true });

    if (filenames.length) {
      acc.push(...filenames);
    }

    return acc;
  }, []);
}

function parseOptions(rawArgv) {
  const parsedArgv = yargs(rawArgv)
    .usage('Usage: $0 [options] <files ...>')
    //
    .describe(
      OptionNames.OUT_DIR,
      'Path to the directory to compile .ftl files into',
    )
    .default(OptionNames.OUT_DIR, null)
    .alias('d', OptionNames.OUT_DIR)
    //
    // .describe(OptionNames.OUT_FILE)
    // .default(OptionNames.OUT_FILE, null)
    // .alias('f', OptionNames.OUT_FILE)
    //
    .describe(OptionNames.SPLIT_TOP_LEVEL_SUBTREES)
    .default(OptionNames.SPLIT_TOP_LEVEL_SUBTREES, false)
    .alias('s', OptionNames.SPLIT_TOP_LEVEL_SUBTREES)
    //
    .describe(
      OptionNames.OUT_RELATIVE_DIR,
      'Path to the directory for output files to be relative to',
    )
    .default(OptionNames.OUT_RELATIVE_DIR, process.cwd())
    .alias('r', OptionNames.OUT_RELATIVE_DIR)
    //
    .parse(rawArgv);

  return {
    cli: {
      entries: getCLIEntries(parsedArgv),
    },
    core: {
      transform: {
        splitTopLevelSubtrees: parsedArgv[OptionNames.SPLIT_TOP_LEVEL_SUBTREES],
      },
      output: {
        context: getAbsolutePath(parsedArgv[OptionNames.OUT_RELATIVE_DIR]),
        path: getAbsolutePath(parsedArgv[OptionNames.OUT_DIR]),
        filename: '[parentname].ftl',
        subtreeFilename: '[parentname]/[subtree].ftl',
      },
    },
  };
}

module.exports = {
  parseOptions,
  OptionNames,
};
