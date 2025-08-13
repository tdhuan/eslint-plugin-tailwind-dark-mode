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
    // All neutral colors with mappings should work
    {
      code: '<div className="text-neutral-100 dark:text-neutral-900 bg-neutral-50 dark:bg-neutral-950" />',
    },
    // Non-color text classes should be ignored
    {
      code: '<div className="text-sm text-left text-center text-right text-justify" />',
    },
    {
      code: '<div className="text-xs text-base text-lg text-xl text-2xl text-3xl" />',
    },
    {
      code: '<div className="text-ellipsis text-clip text-wrap text-nowrap" />',
    },
    // Non-color border classes should be ignored
    {
      code: '<div className="border border-0 border-2 border-4 border-8" />',
    },
    {
      code: '<div className="border-x border-y border-t border-r border-b border-l" />',
    },
    {
      code: '<div className="border-solid border-dashed border-dotted border-double border-none" />',
    },
    // Non-color background classes should be ignored
    {
      code: '<div className="bg-none bg-auto bg-cover bg-contain" />',
    },
    // Shadow classes without colors should be ignored
    {
      code: '<div className="shadow shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl shadow-none" />',
    },
    // Mixed color and non-color classes should only check colors
    {
      code: '<div className="text-neutral-900 dark:text-neutral-100 text-sm border-2 border-gray-200 dark:border-gray-800" />',
    },
  ],

  invalid: [
    // Missing dark variant for text property - should map to correct dark variant
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
      output: '<div className="text-neutral-900 dark:text-neutral-100" />',
    },
    // Missing dark variant for bg property - no mapping available, keep same
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
    // Multiple missing dark variants for different properties - with proper mapping
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
        '<div className="text-neutral-900 bg-white dark:text-neutral-100 dark:bg-black" />',
    },
    // Template literal with missing dark variant - with proper mapping
    {
      code: 'const cls = `text-neutral-900`;',
      errors: [
        {
          messageId: 'missingDarkMode',
        },
      ],
      output: 'const cls = `text-neutral-900 dark:text-neutral-100`;',
    },
    // Classnames with missing dark variants - with proper mapping
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
    // Test specific color mappings
    {
      code: '<div className="text-neutral-50" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-neutral-50',
          },
        },
      ],
      output: '<div className="text-neutral-50 dark:text-neutral-950" />',
    },
    {
      code: '<div className="bg-slate-200" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'bg-slate-200',
          },
        },
      ],
      output: '<div className="bg-slate-200 dark:bg-slate-800" />',
    },
    // Test white/black special values
    {
      code: '<div className="text-white" />',
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'text-white',
          },
        },
      ],
      output: '<div className="text-white dark:text-black" />',
    },
    // Test that custom mappings work correctly with auto-fix
    {
      code: '<div className="bg-red-500" />',
      options: [
        {
          mappings: {
            'red-500': 'red-700',
          },
        },
      ],
      errors: [
        {
          messageId: 'missingDarkMode',
          data: {
            className: 'bg-red-500',
          },
        },
      ],
      output: '<div className="bg-red-500 dark:bg-red-700" />',
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
