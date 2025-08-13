// import type { ESLint, Linter } from "eslint";
import enforceDarkModeClassPairs from './rules/enforce-dark-mode-class-pairs';

// Export individual rules
export const rules = {
  'enforce-dark-mode-class-pairs': enforceDarkModeClassPairs,
};

// Export configurations
export const configs = {
  recommended: {
    plugins: ['tailwind-dark-mode'],
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  },
  strict: {
    plugins: ['tailwind-dark-mode'],
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
        'error',
        {
          autofix: true,
          properties: ['text', 'bg', 'border', 'outline', 'divide', 'ring'],
        },
      ],
    },
  },
};

// Support for ESLint v9 flat config
export const flatConfigs = {
  recommended: {
    name: 'tailwind-dark-mode/recommended',
    plugins: {
      'tailwind-dark-mode': {
        rules,
      },
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  },
  strict: {
    name: 'tailwind-dark-mode/strict',
    plugins: {
      'tailwind-dark-mode': {
        rules,
      },
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
        'error',
        {
          autofix: true,
          properties: ['text', 'bg', 'border', 'outline', 'divide', 'ring'],
        },
      ],
    },
  },
};

// Main plugin export
const plugin = {
  rules,
  configs,
  // ESLint v9 compatibility
  meta: {
    name: 'eslint-plugin-tailwind-dark-mode',
    version: '1.0.0',
  },
};

// Export for both CommonJS and ESM
export default plugin;
