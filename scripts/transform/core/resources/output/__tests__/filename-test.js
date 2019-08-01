const { ResourceTypes } = require('../../../const');
const { getOutputFilename } = require('../filename');

const DEFAULT_OPTIONS = {
  context: null,
  path: null,
  filename: '[parentname].ftl',
  subtreeFilename: '[parentname]/[subtree].ftl',
};

const DEFAULT_RESOURCE = {
  type: ResourceTypes.RESOURCE,
  parent: { filename: '~/locales/en/translation.json' },
};

describe('getOutputFilename(resource, outputOptions)', () => {
  describe('resource.type', () => {
    // template literal to satisfy "jest/valid-describe" eslint rule
    describe(`${JSON.stringify(ResourceTypes.RESOURCE)}`, () => {
      it('should reflect outputOptions.filename', () => {
        function resolve(filename) {
          return getOutputFilename(DEFAULT_RESOURCE, {
            ...DEFAULT_OPTIONS,
            filename,
          });
        }

        expect(resolve('[parentname].ftl'))
          .toMatch(/translation\.ftl$/);

        expect(resolve('[parentname]-next.ftl'))
          .toMatch(/translation-next\.ftl$/);

        expect(resolve('next.ftl'))
          .toMatch(/(?:(?!translation))\/next\.ftl$/);
      });
    });

    // template literal to satisfy "jest/valid-describe" eslint rule
    describe(`${JSON.stringify(ResourceTypes.SUBTREE)}`, () => {
      it('should reflect outputOptions.subtreeFilename', () => {
        const resource = {
          type: ResourceTypes.SUBTREE,
          name: 'main-page',
          parent: { filename: '~/locales/en/translation.json' },
        };

        function resolve(subtreeFilename) {
          return getOutputFilename(resource, {
            ...DEFAULT_OPTIONS,
            subtreeFilename,
          });
        }

        expect(resolve('[parentname]/[subtree].ftl'))
          .toMatch(/translation\/main-page\.ftl$/);

        expect(resolve('[parentname]_[subtree].ftl'))
          .toMatch(/translation_main-page\.ftl$/);

        expect(resolve('[subtree][parentext]'))
          .toMatch(/(?:(?!translation))\/main-page\.json$/);
      });
    });
  });

  describe('outputOptions', () => {
    describe('.path', () => {
      describe('missing', () => {
        it('should use dirname of parent resource', () => {
          const filename = getOutputFilename(DEFAULT_RESOURCE, DEFAULT_OPTIONS);

          expect(filename).toBe('~/locales/en/translation.ftl');
        });
      });

      describe('defined', () => {
        it('should throw if outputOptions.context is missing', () => {
          const outputOptions = {
            ...DEFAULT_OPTIONS,
            path: '~/build',
          };

          expect(() => getOutputFilename(DEFAULT_RESOURCE, outputOptions)).toThrow();
        });

        it('should resolve filename to outputOptions.path', () => {
          const outputOptions = {
            ...DEFAULT_OPTIONS,
            context: '~/',
            path: '~/build',
          };

          const filename = getOutputFilename(DEFAULT_RESOURCE, outputOptions);

          expect(filename).toMatch(/^~\/build\//);
        });
      });
    });

    describe('.context', () => {
      describe('missing', () => {
        it('should be ignored', () => {
          function resolve(context) {
            return getOutputFilename(DEFAULT_RESOURCE, {
              ...DEFAULT_OPTIONS,
              context,
            });
          }

          const expectedPattern = /^~\/locales\/en\//;

          expect(resolve('~/')).toMatch(expectedPattern);
          expect(resolve('~/locales')).toMatch(expectedPattern);
          expect(resolve('/')).toMatch(expectedPattern);
          expect(resolve('~/locales/en/translation')).toMatch(expectedPattern);
        });
      });

      describe('defined', () => {
        it('should reflect outputOptions.context', () => {
          function resolve(context) {
            return getOutputFilename(DEFAULT_RESOURCE, {
              ...DEFAULT_OPTIONS,
              context,
              path: '~/build',
            });
          }

          expect(resolve('~/')).toMatch(/^~\/build\/locales\/en\//);
          expect(resolve('~/locales')).toMatch(/^~\/build\/en\//);
        });
      });
    });
  });
});
