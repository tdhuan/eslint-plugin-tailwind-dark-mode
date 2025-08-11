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
    // Classes with dark variants for the same property group
    {
      code: '<div className="text-neutral-900 dark:text-white" />',
    },
    {
      code: '<div className="bg-red-500 dark:bg-red-700" />',
    },
    {
      code: '<div className="bg-white dark:bg-black border-gray-200 dark:border-gray-800" />',
    },
    {
      code: '<div className="text-black dark:text-white" />',
    },
    {
      code: '<div className="pb-2 pt-4 text-2xl capitalize text-black dark:text-white sm:pt-6" />',
    },
    // Template literal with dark variants
    {
      code: 'const cls = `text-neutral-900 dark:text-neutral-100`;',
    },
    // Classnames with dark variants
    {
      code: 'classnames("text-neutral-900 dark:text-neutral-100", "bg-white dark:bg-black")',
    },
    // clsx with dark variants
    {
      code: 'clsx("border-gray-200 dark:border-gray-800")',
    },
    // Properties not in the check list (should be ignored)
    {
      code: '<div className="flex items-center justify-between" />',
    },
    // Dark classes outside scope should be ignored
    {
      code: '<div className="dark:underline dark:decoration-red-500" />',
    },
    // Mix of tracked and untracked properties
    {
      code: '<div className="text-black dark:text-white flex items-center" />',
    },
  ],

  invalid: [
    // Missing dark variant for text property
    {
      code: '<div className="text-neutral-900" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-neutral-900',
          },
        },
      ],
      output: '<div className="text-neutral-900 dark:text-neutral-900" />',
    },
    // Missing dark variant for bg property
    {
      code: '<div className="bg-red-500" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'bg-red-500',
          },
        },
      ],
      output: '<div className="bg-red-500 dark:bg-red-500" />',
    },
    // Multiple missing dark variants for different properties
    {
      code: '<div className="text-neutral-900 bg-white" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-neutral-900',
          },
        },
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'bg-white',
          },
        },
      ],
      output:
        '<div className="text-neutral-900 bg-white dark:text-neutral-900 dark:bg-white" />',
    },
    // Template literal with missing dark variant
    {
      code: 'const cls = `text-neutral-900`;',
      errors: [
        {
          messageId: 'missingDarkMode',
        },
      ],
      output: 'const cls = `text-neutral-900 dark:text-neutral-900`;',
    },
    // Classnames with missing dark variants
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
        'classnames("text-neutral-900 dark:text-neutral-900", "bg-white dark:bg-white")',
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
          properties: ['text'],
        },
      ],
    },
  ],
  invalid: [
    {
      code: '<div className="text-blue-600" />',
      options: [
        {
          properties: ['text'],
        },
      ],
      errors: [
        {
          messageId: 'missingDarkMode',
        },
      ],
      output: '<div className="text-blue-600 dark:text-blue-600" />',
    },
  ],
});
