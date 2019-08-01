/* eslint-disable global-require */

const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(require('child_process').exec);
const rimrafAsync = util.promisify(require('rimraf'));

const FIXTURE_ROOT_PATH = path.join(__dirname, '..');
const BUILD_PATH = path.join(FIXTURE_ROOT_PATH, 'build');

const LOCALES = ['en', 'ru'];

const TEST_MESSAGES = {
  greetings: {
    key: 'mainPage.header.greetings',
    value: {
      en: 'Hello, world!',
      ru: 'Всем привет!',
    },
  },
};

const fluentResourcePaths = {
  en: path.join(BUILD_PATH, 'locales/en/common.ftl'),
  ru: path.join(BUILD_PATH, 'locales/ru/common.ftl'),
};

// eslint-disable-next-line no-shadow
function isExisting(path) {
  return new Promise((resolve) => {
    fs.promises.access(path)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

describe('End-to-end', () => {
  beforeAll(async () => {
    const existing = await isExisting(BUILD_PATH);

    if (existing) {
      await rimrafAsync(BUILD_PATH);
    }
  });

  describe('migration pipeline', () => {
    it('should read original resources and messages with "i18next"', async () => {
      const i18nextGlobal = require('i18next');
      const i18next = i18nextGlobal.createInstance();

      await i18next
        .use(require('i18next-node-fs-backend'))
        .init({
          ns: ['common'],
          defaultNS: 'common',

          backend: {
            loadPath: 'resources/locales/{{lng}}/{{ns}}.json',
            jsonIndent: 2,
          },
        });

      async function testLocale(locale) {
        await i18next.changeLanguage(locale);
        const message = i18next.t(TEST_MESSAGES.greetings.key);

        expect(message).toBe(TEST_MESSAGES.greetings.value[locale]);
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const locale of LOCALES) {
        await testLocale(locale);
      }
    });

    it('should transform original "i18next" resources', async () => {
      await execAsync(
        'i18next-to-fluent ' +
        `-d build ` +
        `-r resources ` +
        'resources/locales/*/*.json',
        { cwd: FIXTURE_ROOT_PATH, encoding: 'utf8' },
      );

      // eslint-disable-next-line no-restricted-syntax
      for await (const p of Object.values(fluentResourcePaths)) {
        // check whether the file exists
        await expect(isExisting(p)).resolves.toBe(true);
      }
    });

    it('should read transformed resources with Fluent adapter', async () => {
      const bundles = {};

      // eslint-disable-next-line no-restricted-syntax
      for await (const [locale, p] of Object.entries(fluentResourcePaths)) {
        const { FluentBundle, FluentResource } = require('@fluent/bundle');

        const bundle = new FluentBundle(locale);
        const text = await fs.promises.readFile(p);
        bundle.addResource(new FluentResource(text));
        bundles[locale] = bundle;
      }

      const { createProvider } = require('i18next-to-fluent/src/utils/provider/createProvider');
      const { transformNesting } = require('i18next-to-fluent/src/utils/provider/resolvers/nesting');

      const getMessage = createProvider({ resolvers: [transformNesting] });

      function testLocale(locale) {
        const message = getMessage(
          TEST_MESSAGES.greetings.key,
          bundles[locale],
        );

        expect(message).toBe(TEST_MESSAGES.greetings.value[locale]);
      }

      LOCALES.forEach(testLocale);
    });
  });
});
