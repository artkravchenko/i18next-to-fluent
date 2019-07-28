module.exports = {
  extends: ['eslint:recommended', 'airbnb-base'],

  rules: {
    'arrow-body-style': 'off',
    'operator-linebreak': ['error', 'after', {
      overrides: {
        '?': 'before',
        ':': 'before',
      },
    }],
    'quotes': ['error', 'single', {
      allowTemplateLiterals: true,
    }],
    'prefer-destructuring': 'off',

    'import/prefer-default-export': 'off',    
  }
};
