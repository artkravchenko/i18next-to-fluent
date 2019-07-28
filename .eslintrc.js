module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:jest/recommended',
  ],

  plugins: ['jest'],

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
