const { FluentBundle } = require('@fluent/bundle');
const ftl = require('@fluent/dedent');

const { hasThrown } = require('../../../../resources/jest/expect');
const { ResolutionStatus } = require('../const');
const { createProvider } = require('../createProvider');

const GREETINGS_MESSAGE_KEY = 'greetings';
const GREETINGS_MESSAGE_VALUE = 'Hello, world!';

function getBundle() {
  const bundle = new FluentBundle('en-US');

  // the lack of indentation further is intentionnal - `ftl` surprisingly
  // loses the expressions expected to be interpolated
  // (the bag report is coming coon)
  const errors = bundle.addMessages(ftl`
  ${GREETINGS_MESSAGE_KEY} = ${GREETINGS_MESSAGE_VALUE}
  `);

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return bundle;
}

describe('createProvider(options)', () => {
  const bundle = getBundle();

  describe('resolvers', () => {
    describe('application', () => {
      it('should not call resolvers if key exists in the bundle', () => {
        const customResolver = jest.fn();
        const getMessage = createProvider({ resolvers: [customResolver] });

        const text = getMessage(GREETINGS_MESSAGE_KEY, bundle);

        expect(text).toBe(GREETINGS_MESSAGE_VALUE);
        expect(customResolver).not.toHaveBeenCalled();
      });

      it('should call resolvers in the array index ASC order', () => {
        let secondCustomResolver;

        const firstCustomResolver = jest.fn(() => {
          expect(secondCustomResolver).not.toHaveBeenCalled();
        });

        secondCustomResolver = jest.fn(() => {
          expect(firstCustomResolver).toHaveBeenCalled();
        });

        const getMessage = createProvider({
          resolvers: [firstCustomResolver, secondCustomResolver],
        });

        try {
          getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);
        // eslint-disable-next-line no-empty
        } catch (e) {}

        expect(firstCustomResolver).toHaveBeenCalled();
        expect(secondCustomResolver).toHaveBeenCalled();
        expect(hasThrown(firstCustomResolver)).toBe(false);
        expect(hasThrown(secondCustomResolver)).toBe(false);
      });

      it('should throw if key does not exist and there is no resolver', () => {
        const getMessage = createProvider({ resolvers: [] });
        const NON_EXISTING_KEY = `${GREETINGS_MESSAGE_KEY}123`;

        expect(() => getMessage(NON_EXISTING_KEY, bundle)).toThrow();
      });
    });

    describe('arguments', () => {
      describe('req', () => {
        describe('.key', () => {
          it('should be equal to the requested key for the first resolver', () => {
            const REQUESTED_KEY = `${GREETINGS_MESSAGE_KEY}123`;

            function customResolver(req) {
              expect(req.key).toBe(REQUESTED_KEY);
            }

            const getMessage = createProvider({ resolvers: [customResolver] });

            try {
              getMessage(REQUESTED_KEY, bundle);
              // eslint-disable-next-line no-empty
            } catch (e) {}

            expect.hasAssertions();
          });
        });

        describe('.args', () => {
          it('should be deeply equal to the requested args for the first transformer', () => {
            const REQUESTED_ARGS = {
              name: 'John',
            };

            function customResolver(req) {
              expect(req.args).toEqual(REQUESTED_ARGS);
            }

            const getMessage = createProvider({ resolvers: [customResolver] });

            try {
              getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle, REQUESTED_ARGS);
              // eslint-disable-next-line no-empty
            } catch (e) {}

            expect.hasAssertions();
          });
        });
      });

      describe('provider', () => {});
    });

    describe('return value', () => {
      const RESOLUTION_STATUS_SKIPPED = JSON.stringify(ResolutionStatus.SKIPPED);

      function runResolutionStatusSkippedTests(options) {
        // notice "use" verb here: it means "call and use returned value"
        it('should use the following resolver', () => {
          const skippingResolver = jest.fn(() => {
            return options.resolverReturnValue;
          });

          const effectiveResolver = jest.fn(() => {
            return {
              status: ResolutionStatus.KEY_TRANSFORMED,
              payload: GREETINGS_MESSAGE_KEY,
            };
          });

          const getMessage = createProvider({
            resolvers: [skippingResolver, effectiveResolver],
          });

          const text = getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);

          expect(skippingResolver).toHaveBeenCalled();
          expect(effectiveResolver).toHaveBeenCalled();
          expect(text).toBe(GREETINGS_MESSAGE_VALUE);
        });

        // FIXME: should we test "latest" meaning "last transformed"?
        it('should pass the latest key to the following resolver', () => {
          const REQUESTED_KEY = `${GREETINGS_MESSAGE_KEY}123`;

          const skippingResolver = jest.fn(() => {
            return options.resolverReturnValue;
          });

          const anotherResolver = jest.fn((req) => {
            expect(req.key).toBe(REQUESTED_KEY);
          });

          const getMessage = createProvider({
            resolvers: [skippingResolver, anotherResolver],
          });

          try {
            getMessage(REQUESTED_KEY, bundle);
            // eslint-disable-next-line no-empty
          } catch (e) {}

          expect(skippingResolver).toHaveBeenCalled();
          expect(anotherResolver).toHaveBeenCalled();
          expect(hasThrown(anotherResolver)).toBe(false);
        });

        it('should throw an error if there is no resolver remaining', () => {
          const skippingResolver = jest.fn(() => {
            return options.resolverReturnValue;
          });

          const getMessage = createProvider({
            resolvers: [skippingResolver],
          });

          const requestedKey = `${GREETINGS_MESSAGE_KEY}123`;

          expect(() => getMessage(requestedKey, bundle)).toThrow();
          expect(skippingResolver).toHaveBeenCalled();
        });
      }

      describe('null', () => {
        describe(`processed as .status === ${RESOLUTION_STATUS_SKIPPED}`, () => {
          runResolutionStatusSkippedTests({
            resolverReturnValue: null,
          });
        });
      });

      describe('.status', () => {
        // template literal to satisfy "jest/valid-describe" eslint rule
        describe(`${RESOLUTION_STATUS_SKIPPED}`, () => {
          runResolutionStatusSkippedTests({
            resolverReturnValue: {
              status: ResolutionStatus.SKIPPED,
            },
          });
        });

        // template literal to satisfy "jest/valid-describe" eslint rule
        describe(`${JSON.stringify(ResolutionStatus.KEY_TRANSFORMED)}`, () => {
          it('should use returned key to resolve message value', () => {
            const resolver = jest.fn(() => {
              return {
                status: ResolutionStatus.KEY_TRANSFORMED,
                payload: GREETINGS_MESSAGE_KEY,
              };
            });

            const getMessage = createProvider({
              resolvers: [resolver],
            });

            const text = getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);

            expect(resolver).toHaveBeenCalled();
            expect(text).toBe(GREETINGS_MESSAGE_VALUE);
          });

          it('should not call the following resolver if the key exists', () => {
            const firstResolver = jest.fn(() => {
              return {
                status: ResolutionStatus.KEY_TRANSFORMED,
                payload: GREETINGS_MESSAGE_KEY,
              };
            });

            const secondResolver = jest.fn();

            const getMessage = createProvider({
              resolvers: [firstResolver, secondResolver],
            });

            try {
              getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);
              // eslint-disable-next-line no-empty
            } catch (e) {}

            expect(firstResolver).toHaveBeenCalled();
            expect(secondResolver).not.toHaveBeenCalled();
          });

          it('should pass returned key to the following resolver', () => {
            const FIRST_RESOLVER_TRANSFORMED_KEY = `_${GREETINGS_MESSAGE_KEY}`;

            const firstResolver = jest.fn(() => {
              return {
                status: ResolutionStatus.KEY_TRANSFORMED,
                payload: FIRST_RESOLVER_TRANSFORMED_KEY,
              };
            });

            const secondResolver = jest.fn((req) => {
              expect(req.key).toBe(FIRST_RESOLVER_TRANSFORMED_KEY);
            });

            const getMessage = createProvider({
              resolvers: [firstResolver, secondResolver],
            });

            try {
              getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);
              // eslint-disable-next-line no-empty
            } catch (e) {}

            expect(firstResolver).toHaveBeenCalled();
            expect(secondResolver).toHaveBeenCalled();
            expect(hasThrown(secondResolver)).toBe(false);
          });
        });

        // template literal to satisfy "jest/valid-describe" eslint rule
        describe(`${JSON.stringify(ResolutionStatus.VALUE_PROVIDED)}`, () => {
          it('should not call the following resolver', () => {
            const firstResolver = jest.fn(() => {
              return {
                status: ResolutionStatus.VALUE_PROVIDED,
                payload: 'Hi there!',
              };
            });

            const secondResolver = jest.fn();

            const getMessage = createProvider({
              resolvers: [firstResolver, secondResolver],
            });

            try {
              getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);
              // eslint-disable-next-line no-empty
            } catch (e) {}

            expect(firstResolver).toHaveBeenCalled();
            expect(secondResolver).not.toHaveBeenCalled();
          });

          it('should use returned message value as result', () => {
            const PROVIDED_MESSAGE_VALUE = 'Hi there!';

            const firstResolver = jest.fn(() => {
              return {
                status: ResolutionStatus.VALUE_PROVIDED,
                payload: PROVIDED_MESSAGE_VALUE,
              };
            });

            const getMessage = createProvider({
              resolvers: [firstResolver],
            });

            const text = getMessage(`${GREETINGS_MESSAGE_KEY}123`, bundle);

            expect(firstResolver).toHaveBeenCalled();
            expect(text).toBe(PROVIDED_MESSAGE_VALUE);
          });
        });

        describe('other', () => {
          it('should throw without calling the following resolvers', () => {
            const firstResolver = jest.fn(() => {
              return { status: 'custom' };
            });

            const secondResolver = jest.fn();

            const getMessage = createProvider({
              resolvers: [firstResolver, secondResolver],
            });

            const REQUESTED_KEY = `${GREETINGS_MESSAGE_KEY}123`;

            expect(() => getMessage(REQUESTED_KEY, bundle)).toThrow();
            expect(firstResolver).toHaveBeenCalled();
            expect(secondResolver).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('cache', () => {});
  });
});
