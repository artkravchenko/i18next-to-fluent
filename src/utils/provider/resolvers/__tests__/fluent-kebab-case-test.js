const { ResolutionStatus } = require('../../const');
const { isResolutionSkipped } = require('../../createProvider');
const { transformToFluentKebabCase } = require('../fluent-kebab-case');

describe('transformToFluentKebabCase(req)', () => {
  describe('req.key', () => {
    describe('kebab-cased', () => {
      it('should leave without transformation', () => {
        const res = transformToFluentKebabCase({ key: 'main-page' });

        expect(isResolutionSkipped(res)).toBe(true);
      });
    });

    describe('camelCased', () => {
      it('should transform to kebab case', () => {
        const res = transformToFluentKebabCase({ key: 'mainPage' });

        expect(isResolutionSkipped(res)).toBe(false);
        expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
        expect(res.payload).toBe('main-page');
      });
    });

    describe('PascalCased', () => {
      it('should transform to kebab case with heading "_" instead of "-"', () => {
        const res = transformToFluentKebabCase({ key: 'MainPage' });

        expect(isResolutionSkipped(res)).toBe(false);
        expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
        expect(res.payload).toBe('_main-page');
      });
    });

    describe('the key starts with "-" symbol', () => {
      it('should transform heading "-" to "_"', () => {
        const res = transformToFluentKebabCase({ key: 'Main-page' });

        expect(isResolutionSkipped(res)).toBe(false);
        expect(res.status).toBe(ResolutionStatus.KEY_TRANSFORMED);
        expect(res.payload).toBe('_main-page');
      });
    });
  });
});
