const fs = require('fs');
const path = require('path');

const { OptionNames, parseOptions } = require('../options');

function getNonExistingPath() {
  return path.join(__filename, 'non-existing.txt');
}

describe('parseOptions(rawArgv)', () => {
  describe('<files ...>', () => {
    describe('missing', () => {
      it('should have `(return value).cli.entries` being an empty array', () => {
        expect(parseOptions([]).cli.entries).toEqual([]);
      });
    });

    describe('<absolute-path>', () => {
      it('should have `(return value).cli.entries` containing the path if the file exists', () => {
        expect(parseOptions([__filename]).cli.entries).toEqual([__filename]);
      });

      it('should not have `(return value).cli.entries` the path if the file does not exist', () => {
        const nonExistingPath = getNonExistingPath();

        expect(parseOptions([nonExistingPath]).cli.entries).toEqual([]);
      });
    });

    describe('<relative-path>', () => {
      it('should have `(return value).cli.entries` containing resolved path if the file exists', () => {
        const relativeFilename = path.relative(process.cwd(), __filename);

        expect(parseOptions([relativeFilename]).cli.entries).toEqual([__filename]);
      });

      it('should not have `(return value).cli.entries` the path if the file does not exist', () => {
        const nonExistingPath = getNonExistingPath();
        const relativeFilename = path.relative(process.cwd(), nonExistingPath);

        expect(parseOptions([relativeFilename]).cli.entries).toEqual([]);
      });
    });

    describe('<glob>', () => {
      it('should have `(return value).cli.entries` containing resolved paths', () => {
        const currentDirectoryChildren = fs
          .readdirSync(__dirname)
          .map(pathString => path.join(__dirname, pathString));

        const resolvedEntries = parseOptions([`${__dirname}/*`]).cli.entries;

        expect(currentDirectoryChildren).not.toHaveLength(0);
        expect(resolvedEntries).toEqual(currentDirectoryChildren);
      });
    });

    describe('multiple paths', () => {
      it('should have `(return value).cli.entries` containing all resolved paths', () => {
        const thisModuleRelativeFilename = path.relative(
          process.cwd(),
          __filename,
        );
        const testedModulePath = require.resolve('../options');
        const testedModuleRelativePath = path.relative(
          process.cwd(),
          testedModulePath,
        );

        const options = parseOptions([
          testedModuleRelativePath,
          thisModuleRelativeFilename,
        ]);

        expect(options.cli.entries).toEqual([testedModulePath, __filename]);
      });
    });
  });

  describe(`--${OptionNames.OUT_DIR}`, () => {
    describe('missing', () => {
      it('should have `(return value).core.output.path` being `null`', () => {
        expect(parseOptions([]).core.output.path).toBe(null);
      });
    });

    describe('<relative-path>', () => {
      it('should have `(return value).core.output.path` being an absolute path', () => {
        const relativeFilename = path.relative(process.cwd(), __dirname);

        const options = parseOptions([
          `--${OptionNames.OUT_DIR}`,
          relativeFilename,
        ]);

        expect(options.core.output.path).toBe(__dirname);

        // the same should be supported for "-d" alias as well
        const aliasOptions = parseOptions(['-d', relativeFilename]);

        expect(aliasOptions.core.output.path).toBe(__dirname);
      });
    });
  });

  describe(`--${OptionNames.OUT_RELATIVE_DIR}`, () => {
    describe('missing', () => {
      it('should have `(return value).core.output.context` being `process.cwd()`', () => {
        expect(parseOptions([]).core.output.context).toBe(process.cwd());
      });
    });

    describe('<relative-path>', () => {
      it('should have `(return value).core.output.context` being an absolute path', () => {
        const relativeFilename = path.relative(process.cwd(), __dirname);

        const options = parseOptions([
          `--${OptionNames.OUT_RELATIVE_DIR}`,
          relativeFilename,
        ]);

        expect(options.core.output.context).toBe(__dirname);

        // the same should be supported for "-r" alias as well
        const aliasOptions = parseOptions(['-r', relativeFilename]);

        expect(aliasOptions.core.output.context).toBe(__dirname);
      });
    });
  });

  describe(`--${OptionNames.SPLIT_TOP_LEVEL_SUBTREES}`, () => {
    describe('missing', () => {
      it('should have `(return value).core.transform.splitTopLevelSubtrees` being `false`', () => {
        expect(parseOptions([]).core.transform.splitTopLevelSubtrees).toBe(false);
      });
    });
  });
});
