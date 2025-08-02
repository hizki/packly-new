/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.{tsx,jsx}',
      options: {
        singleAttributePerLine: true,
      },
    },
  ],
}; 
