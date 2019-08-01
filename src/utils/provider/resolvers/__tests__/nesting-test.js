const { FluentBundle, FluentResource } = require('@fluent/bundle');
const ftl = require('@fluent/dedent');

const { ResolutionStatus } = require('../../const');
const { isResolutionSkipped } = require('../../createProvider');
const { transformNesting } = require('../nesting');

function getBundle() {
  const bundle = new FluentBundle('en-US');

  // the lack of indentation further is intentionnal - `ftl` surprisingly
  // loses the expressions expected to be interpolated
  // (the bag report is coming coon)
  const resource = new FluentResource(ftl`
  message_test = Hello from the message!

  message_containing_attribute =
    .test = Hello from the attribute!

  message_over_attribute_test = message value resolved!

  message_over_attribute =
    .test = attribute value resolved!
  `);

  const errors = bundle.addResource(resource);

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return bundle;
}

describe('transformNesting(req, provider)', () => {
  const provider = { bundle: getBundle() };

  describe('req.key', () => {
    describe('does not contain "." symbols', () => {
      it('should leave without transformation', () => {
        const res = transformNesting({ key: 'greetings' }, provider);

        expect(isResolutionSkipped(res)).toBe(true);
      });
    });

    describe('contains "." symbols', () => {
      describe('type of underlying entity', () => {
        describe('message', () => {
          describe('non-existing', () => {
            it('should leave without transformation', () => {
              const res = transformNesting(
                { key: 'non-existing-message.test' },
                provider,
              );

              expect(isResolutionSkipped(res)).toBe(true);
            });
          });

          describe('existing', () => {
            it('should transform all "." to "_"', () => {
              const res = transformNesting({ key: 'message.test' }, provider);

              expect(isResolutionSkipped(res)).toBe(false);
              expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
              expect(res.payload).toBe('message_test');
            });
          });
        });

        describe('attribute', () => {
          describe('non-existing', () => {
            it('should leave without transformation', () => {
              const res = transformNesting(
                { key: 'message-containing-attribute.non-existing-attribute' },
                provider,
              );

              expect(isResolutionSkipped(res)).toBe(true);
            });
          });

          describe('existing', () => {
            it('should transform all "." except the trailing one to "_"', () => {
              const res = transformNesting(
                { key: 'message.containing.attribute.test' },
                provider,
              );

              expect(isResolutionSkipped(res)).toBe(false);
              expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
              expect(res.payload).toEqual({
                key: 'message_containing_attribute',
                attribute: 'test',
              });
            });
          });
        });

        describe('collision of names', () => {
          it('should check if the key is the path to message first', () => {
            const res = transformNesting({ key: 'message.over.attribute.test' }, provider);

            expect(isResolutionSkipped(res)).toBe(false);
            expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
            expect(res.payload).toBe('message_over_attribute_test');
          });
        });
      });
    });
  });
});
