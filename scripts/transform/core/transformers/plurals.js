
const PROCESSED_PLURALS_STATE_KEY = 'processedPlurals';
const PLURAL_KEY_PATTERN = /_(?:(\d+|plural))$/;
const PLURAL_KEY_SUFFIX_PATTERN = /_(\d+|plural)$/;
const DEFAULT_FALLBACK_KEY = 'default';

function mapI18nextSuffixToCLDRCategory(suffix, locale) {
  switch (suffix) {
    case '0': return 'one';
    case '1': return 'few';
    case '2': return 'other';
    default: throw new Error(
      "Expected plural index to be '0', '1', or '2'. " +
      `Instead got: ${JSON.stringify(suffix)}. ` +
      'This suffix is not supported at the moment. Please report the issue.',
    );
  }
}

function getCLDRCategories(locale) {
  return ['one', 'few', 'other'];
}

function getPluralOptions(prefix, phrases, locale) {
  if (phrases[`${prefix}_plural`]) {
    return [
      { key: 'one', value: phrases[prefix] || prefix },
      { key: 'other', value: phrases[`${prefix}_plural`], default: true },
    ];
  }

  const options = [];

  const pluralKeys = Object.keys(phrases)
    .filter(k => PLURAL_KEY_PATTERN.test(k))
    .sort();

  const localeCLDRCategories = getCLDRCategories(locale);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of pluralKeys) {
    const [, suffix] = key.match(PLURAL_KEY_SUFFIX_PATTERN);
    const category = mapI18nextSuffixToCLDRCategory(suffix, locale);

    options.push({
      default: false,
      key: category,
      value: phrases[key],
    });
  }

  // all plural categories are filled
  if (localeCLDRCategories.length === options.length) {
    const localeCLDRCategoriesAmount = localeCLDRCategories.length - 1;
    const defaultCategory = localeCLDRCategories[localeCLDRCategoriesAmount];
    const defaultOption = options.find(o => o.key === defaultCategory);

    defaultOption.default = true;
  } else {
    options.push({
      key: DEFAULT_FALLBACK_KEY,
      value: phrases[prefix] || prefix,
      default: true,
    });
  }

  return options;
}

/**
 * TODO: transform i18next locales to CLDR automatically
 * @see https://github.com/i18next/i18next/issues/1202
 * @param {*} path
 * @param {*} ctx
 */
function transformPlurals(path, ctx) {
  const { key } = path.node;

  if (!PLURAL_KEY_PATTERN.test(key)) {
    return;
  }

  const [, prefix] = key.match(/^(.*)_(?:(\d+|plural))$/);

  // eslint-disable-next-line no-param-reassign
  path.node = null;

  if (
    ctx.state.has(PROCESSED_PLURALS_STATE_KEY) &&
    ctx.state.get(PROCESSED_PLURALS_STATE_KEY).has(prefix)
  ) {
    return;
  }

  if (!ctx.state.processedPlurals) {
    // eslint-disable-next-line no-param-reassign
    ctx.state.set(PROCESSED_PLURALS_STATE_KEY, new Set());
  }

  ctx.state.get(PROCESSED_PLURALS_STATE_KEY).add(prefix);

  const phrases = path.parentPath.node.value;
  const pluralOptions = getPluralOptions(prefix, phrases, ctx.locale);

  phrases[prefix] = (
    // eslint-disable-next-line prefer-template
    '{ $count ->\n' +
      pluralOptions.map((o) => {
        const begin = o.default ? ' *' : '  ';
        const name = `[${o.key}] `;
        return begin + name + o.value;
      }).join('\n') +
    '\n}'
  );
}

module.exports = {
  transformPlurals,
};
