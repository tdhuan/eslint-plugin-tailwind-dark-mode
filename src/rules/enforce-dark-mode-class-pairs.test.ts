import { RuleTester } from 'eslint';
import rule from '../../src/rules/enforce-dark-mode-class-pairs';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('enforce-dark-mode-class-pairs', rule, {
  valid: [
    // Properly paired classes
    {
      code: '<div className="text-neutral-900 dark:text-neutral-100" />',
    },
    {
      code: '<div className="bg-white dark:bg-black border-gray-200 dark:border-gray-800" />',
    },
    // No dark mode needed for transparent
    {
      code: '<div className="bg-transparent" />',
    },
    // Template literal with proper pairs
    {
      code: 'const cls = `text-neutral-900 dark:text-neutral-100`;',
    },
    // Classnames with proper pairs
    {
      code: 'classnames("text-neutral-900 dark:text-neutral-100", "bg-white dark:bg-black")',
    },
    // clsx with proper pairs
    {
      code: 'clsx("border-gray-200 dark:border-gray-800")',
    },
    // Properties not in the check list
    {
      code: '<div className="flex items-center justify-between" />',
    },
  ],

  invalid: [
    // Missing dark mode class
    {
      code: '<div className="text-neutral-900" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-neutral-900',
            expected: 'dark:text-neutral-100',
          },
        },
      ],
      output: '<div className="text-neutral-900 dark:text-neutral-100" />',
    },
    // Multiple missing dark mode classes
    {
      code: '<div className="text-neutral-900 bg-white" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-neutral-900',
            expected: 'dark:text-neutral-100',
          },
        },
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'bg-white',
            expected: 'dark:bg-black',
          },
        },
      ],
      output:
        '<div className="text-neutral-900 bg-white dark:text-neutral-100 dark:bg-black" />',
    },
    // Mismatched dark mode value
    {
      code: '<div className="text-neutral-900 dark:text-neutral-200" />',
      errors: [
        {
          messageId: 'mismatchedDarkMode',
          data: {
            className: 'text-neutral-900',
            expected: 'dark:text-neutral-100',
            actual: 'dark:text-neutral-200',
          },
        },
      ],
      output: '<div className="text-neutral-900 dark:text-neutral-100" />',
    },
    // Template literal with missing dark mode
    {
      code: 'const cls = `text-neutral-900`;',
      errors: [
        {
          messageId: 'missingDarkMode',
        },
      ],
      output: 'const cls = `text-neutral-900 dark:text-neutral-100`;',
    },
    // Classnames with missing dark mode
    {
      code: 'classnames("text-neutral-900", "bg-white")',
      errors: [
        {
          messageId: 'missingDarkMode',
        },
        {
          messageId: 'missingDarkMode',
        },
      ],
      output:
        'classnames("text-neutral-900 dark:text-neutral-100", "bg-white dark:bg-black")',
    },
    // Dynamic expression warning
    {
      code: 'const cls = `text-neutral-${shade}`;',
      errors: [
        {
          messageId: 'dynamicExpression',
        },
      ],
    },
  ],
});

// Test with custom configuration
const customRuleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

customRuleTester.run('enforce-dark-mode-class-pairs with custom config', rule, {
  valid: [
    {
      code: '<div className="text-blue-600 dark:text-blue-300" />',
      options: [
        {
          mappings: {
            'blue-600': 'blue-300',
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: '<div className="text-blue-600" />',
      options: [
        {
          mappings: {
            'blue-600': 'blue-300',
          },
        },
      ],
      errors: [
        {
          messageId: 'missingDarkMode',
        },
      ],
      output: '<div className="text-blue-600 dark:text-blue-300" />',
    },
  ],
});
