# eslint-plugin-tailwind-dark-mode

**Enforce consistent dark mode class pairs in your Tailwind CSS projects**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Rules](#rules) • [Configuration](#configuration) • [Examples](#examples)

## 🎯 Features

- ✅ **Smart Detection** - Accurately detects missing dark mode variants for color-specific Tailwind CSS classes while avoiding false positives
- 🔧 **Auto-fix Support** - Fix violations automatically with `--fix`
- 🎨 **Configurable Properties** - Customize which Tailwind properties to check for dark mode pairs
- 📦 **Framework Agnostic** - Works with React, Vue, Angular, and vanilla JavaScript
- 🚀 **ESLint v8 & v9** - Full compatibility with both ESLint versions
- 💡 **TypeScript Support** - Full TypeScript support with type definitions
- 🔍 **Multiple Patterns** - Supports JSX className, template literals, classnames/clsx, and variable assignments
- ⚡ **Intelligent Mappings** - Built-in color mappings with support for custom mappings

## 📚 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#%EF%B8%8F-configuration)
  - [ESLint v8 (Legacy Config)](#eslint-v8-legacy-config)
  - [ESLint v9 (Flat Config)](#eslint-v9-flat-config)
- [Rules](#-rules)
- [Usage Examples](#-usage-examples)
- [Advanced Configuration](#-advanced-configuration)
- [Default Mappings](#-default-mappings)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

## 📦 Installation

### npm

```bash
npm install --save-dev eslint-plugin-tailwind-dark-mode
```

### yarn

```bash
yarn add -D eslint-plugin-tailwind-dark-mode
```

### Requirements

- Node.js >= 18.0.0
- ESLint >= 8.0.0 or >= 9.0.0
- Tailwind CSS project with dark mode enabled (`darkMode: 'class'` in config)

## 🚀 Quick Start

### Step 1: Install the plugin

```bash
npm install --save-dev eslint-plugin-tailwind-dark-mode
```

### Step 2: Configure ESLint

#### For ESLint v9 (Recommended)

Create or update `eslint.config.js`:

```javascript
import tailwindDarkMode from 'eslint-plugin-tailwind-dark-mode';

export default [
  // ... other configs
  tailwindDarkMode.flatConfigs.recommended,
];
```

#### For ESLint v8

Update `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['tailwind-dark-mode'],
  extends: ['plugin:tailwind-dark-mode/recommended'],
};
```

### Step 3: Run ESLint

```bash
# Check for violations
npx eslint .

# Auto-fix violations
npx eslint . --fix
```

## ⚙️ Configuration

### ESLint v8 (Legacy Config)

#### Basic Setup (.eslintrc.js)

```javascript
module.exports = {
  plugins: ['tailwind-dark-mode'],
  extends: ['plugin:tailwind-dark-mode/recommended'],
};
```

#### Custom Configuration

```javascript
module.exports = {
  plugins: ['tailwind-dark-mode'],
  rules: {
    'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
      'error',
      {
        // Properties to check for dark mode pairs
        properties: [
          'text',
          'bg',
          'border',
          'outline',
          'divide',
          'ring',
          'shadow',
          'decoration',
          'accent',
          'caret',
          'fill',
          'stroke',
        ],

        // Custom color mappings
        mappings: {
          white: 'black',
          'neutral-900': 'neutral-100',
          'neutral-800': 'neutral-200',
          'brand-primary': 'brand-primary-dark',
        },

        // Enable auto-fixing
        autofix: true,

        // Set severity
        severity: 'error', // or 'warn'
      },
    ],
  },
};
```

#### JSON Configuration (.eslintrc.json)

```json
{
  "plugins": ["tailwind-dark-mode"],
  "extends": ["plugin:tailwind-dark-mode/recommended"],
  "rules": {
    "tailwind-dark-mode/enforce-dark-mode-class-pairs": [
      "error",
      {
        "properties": [
          "text",
          "bg",
          "border",
          "outline",
          "divide",
          "ring",
          "shadow",
          "decoration",
          "accent",
          "caret",
          "fill",
          "stroke"
        ],
        "autofix": true
      }
    ]
  }
}
```

### ESLint v9 (Flat Config)

#### Basic Setup (eslint.config.js)

```javascript
import tailwindDarkMode from 'eslint-plugin-tailwind-dark-mode';

export default [
  {
    plugins: {
      'tailwind-dark-mode': tailwindDarkMode,
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  },
];
```

#### Custom Configuration

```javascript
import js from '@eslint/js';
import tailwindDarkMode from 'eslint-plugin-tailwind-dark-mode';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'tailwind-dark-mode': tailwindDarkMode,
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
        'error',
        {
          properties: [
            'text',
            'bg',
            'border',
            'outline',
            'divide',
            'ring',
            'shadow',
            'decoration',
            'accent',
            'caret',
            'fill',
            'stroke',
          ],
          mappings: {
            // Your custom mappings
            'brand-light': 'brand-dark',
            'surface-primary': 'surface-primary-dark',
          },
          autofix: true,
        },
      ],
    },
  },
];
```

#### TypeScript Configuration

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tailwindDarkMode from 'eslint-plugin-tailwind-dark-mode';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'tailwind-dark-mode': tailwindDarkMode,
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  }
);
```

## 📏 Rules

### `enforce-dark-mode-class-pairs`

Ensures that color-specific Tailwind utility classes have corresponding dark mode variants for consistent theming. The plugin intelligently filters out non-color utilities to prevent false positives.

#### ✅ Valid Examples

```jsx
// Properly paired dark mode classes
<div className="text-neutral-900 dark:text-neutral-100" />
<div className="bg-white dark:bg-black" />
<div className="border-gray-200 dark:border-gray-800" />

// Classes that don't need dark mode pairs (non-color utilities)
<div className="bg-transparent" />
<div className="flex items-center" />
<div className="p-4 mx-auto" />
<div className="text-sm text-left" />
<div className="border-2 border-x border-none" />
<div className="shadow border-solid" />

// With responsive modifiers (plugin checks base utilities)
<div className="text-neutral-900 dark:text-neutral-100 md:text-neutral-800 md:dark:text-neutral-200" />

// Using with classnames/clsx
import clsx from 'clsx';
const classes = clsx(
  'bg-white dark:bg-black',
  'text-gray-900 dark:text-gray-100'
);

// Template literals
const styles = `
  text-neutral-900 dark:text-neutral-100
  bg-white dark:bg-black
`;
```

#### ❌ Invalid Examples

```jsx
// Missing dark mode pair
<div className="text-neutral-900" />
// Error: Missing dark mode pair for "text-neutral-900". Expected: "dark:text-neutral-100"

// Mismatched dark mode value
<div className="text-neutral-900 dark:text-neutral-500" />
// Error: Mismatched dark mode value. Expected "dark:text-neutral-100" but found "dark:text-neutral-500"

// Multiple violations
<div className="bg-white text-gray-900 border-gray-200" />
// Error: Missing dark mode pairs for multiple classes

// In classnames/clsx
classnames(
  'bg-white', // Error: Missing "dark:bg-black"
  'text-gray-900' // Error: Missing "dark:text-gray-100"
);

// Template literals
const styles = `text-neutral-900 bg-white`; // Errors for both classes
```

#### Options

| Option           | Type                | Default                                                                                                              | Description                                      |
| ---------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `properties`     | `string[]`          | `['text', 'bg', 'border', 'outline', 'divide', 'ring', 'shadow', 'decoration', 'accent', 'caret', 'fill', 'stroke']` | Tailwind properties to check for dark mode pairs |
| `mappings`       | `object`            | [See default mappings](#default-mappings)                                                                            | Custom mappings for light to dark color values   |
| `autofix`        | `boolean`           | `true`                                                                                                               | Enable automatic fixing with `--fix`             |
| `severity`       | `'error' \| 'warn'` | `'error'`                                                                                                            | Rule severity level                              |
| `customPrefixes` | `string[]`          | `[]`                                                                                                                 | Additional class prefixes to check               |

## 📖 Usage Examples

### React Components

```jsx
// ✅ Good - Properly paired dark mode classes
function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-neutral-900 dark:text-neutral-100 text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      <div className="p-4 text-neutral-700 dark:text-neutral-300">
        {children}
      </div>
    </div>
  );
}

// ❌ Bad - Missing dark mode pairs
function BadCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* ESLint Error: Missing dark mode pair for "bg-white" */}
      <h2 className="text-neutral-900 text-xl font-bold">
        {/* ESLint Error: Missing dark mode pair for "text-neutral-900" */}
        {title}
      </h2>
    </div>
  );
}
```

### Next.js App

```jsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="bg-neutral-50 dark:bg-neutral-950 p-4">
            {/* Navigation content */}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Using with Utility Functions

```javascript
// utils/classes.js
import clsx from 'clsx';

export function getCardClasses(variant) {
  return clsx(
    // Base styles with dark mode pairs
    'rounded-lg p-4 transition-colors',
    {
      // Primary variant
      primary: 'bg-blue-500 dark:bg-blue-400 text-white dark:text-white',
      // Secondary variant
      secondary:
        'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
      // Ghost variant
      ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    }[variant]
  );
}
```

### Dynamic Classes with Safe Patterns

```jsx
// ❌ Bad - Dynamic classes that can't be verified
function DynamicColor({ shade }) {
  return (
    <div className={`text-gray-${shade}`}>
      {/* Warning: Could not verify dark mode pairs in dynamic expression */}
      Content
    </div>
  );
}

// ✅ Good - Use predefined class maps
const shadeClasses = {
  light: 'text-gray-300 dark:text-gray-700',
  medium: 'text-gray-500 dark:text-gray-500',
  dark: 'text-gray-700 dark:text-gray-300',
};

function SafeDynamicColor({ shade }) {
  return (
    <div className={shadeClasses[shade] || shadeClasses.medium}>Content</div>
  );
}
```

## 🔧 Advanced Configuration

### Custom Color System

```javascript
// eslint.config.js
export default [
  {
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
        'error',
        {
          mappings: {
            // Brand colors
            'brand-50': 'brand-950',
            'brand-100': 'brand-900',
            'brand-200': 'brand-800',
            'brand-300': 'brand-700',
            'brand-400': 'brand-600',
            'brand-500': 'brand-500',
            'brand-600': 'brand-400',
            'brand-700': 'brand-300',
            'brand-800': 'brand-200',
            'brand-900': 'brand-100',
            'brand-950': 'brand-50',

            // Surface colors
            'surface-primary': 'surface-primary-dark',
            'surface-secondary': 'surface-secondary-dark',
            'surface-tertiary': 'surface-tertiary-dark',

            // Semantic colors
            'danger-light': 'danger-dark',
            'warning-light': 'warning-dark',
            'success-light': 'success-dark',
            'info-light': 'info-dark',
          },
        },
      ],
    },
  },
];
```

### Ignore Specific Files

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/generated/**', '**/vendor/**'],
    plugins: {
      'tailwind-dark-mode': tailwindDarkMode,
    },
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'error',
    },
  },
];
```

### Different Rules for Different Files

```javascript
// eslint.config.js
export default [
  // Strict checking for components
  {
    files: ['**/components/**/*.{jsx,tsx}'],
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': [
        'error',
        {
          autofix: true,
          severity: 'error',
        },
      ],
    },
  },
  // Relaxed checking for tests
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      'tailwind-dark-mode/enforce-dark-mode-class-pairs': 'warn',
    },
  },
];
```

## 📊 Default Mappings

The plugin includes comprehensive default mappings for Tailwind's color system:

### Neutral Scale

| Light       | Dark        |
| ----------- | ----------- |
| neutral-50  | neutral-950 |
| neutral-100 | neutral-900 |
| neutral-200 | neutral-800 |
| neutral-300 | neutral-700 |
| neutral-400 | neutral-600 |
| neutral-500 | neutral-500 |
| neutral-600 | neutral-400 |
| neutral-700 | neutral-300 |
| neutral-800 | neutral-200 |
| neutral-900 | neutral-100 |
| neutral-950 | neutral-50  |

### Other Color Scales

The same pattern applies to:

- `slate-*`
- `gray-*`
- `zinc-*`
- `stone-*`

### Special Values

| Light       | Dark        |
| ----------- | ----------- |
| white       | black       |
| black       | white       |
| transparent | transparent |

## 🎯 API Reference

### Plugin Export

```typescript
interface Plugin {
  rules: {
    'enforce-dark-mode-class-pairs': Rule.RuleModule;
  };
  configs: {
    recommended: Linter.Config;
    strict: Linter.Config;
  };
  flatConfigs: {
    recommended: Linter.FlatConfig;
    strict: Linter.FlatConfig;
  };
  meta: {
    name: string;
    version: string;
  };
}
```

### Rule Options

```typescript
interface DarkModeConfig {
  /** Properties to check for dark mode pairs */
  properties?: string[];

  /** Custom mappings for light to dark values */
  mappings?: Record<string, string>;

  /** Whether to automatically fix missing dark mode classes */
  autofix?: boolean;

  /** Severity level for missing pairs */
  severity?: 'error' | 'warn';

  /** Additional class prefixes to check */
  customPrefixes?: string[];
}
```

## 🐛 Troubleshooting

### Common Issues

#### Plugin not detecting classes

**Problem:** The plugin isn't detecting Tailwind classes in your files.

**Solution:** Ensure your ESLint configuration includes JSX parsing:

```javascript
// .eslintrc.js
module.exports = {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
```

#### False positives on non-color utilities

**Problem:** Getting errors for utilities that don't need dark mode pairs (like `text-sm`, `border-2`, `shadow`, etc.).

**Solution:** This has been fixed in recent versions! The plugin now automatically filters out non-color classes. It only checks classes that contain actual Tailwind color names (like `neutral`, `gray`, `red`, etc.). If you're still experiencing issues, ensure you're using the latest version.

#### Custom colors not recognized

**Problem:** Your custom Tailwind colors aren't being recognized.

**Solution:** Add custom mappings for your design system:

```javascript
'tailwind-dark-mode/enforce-dark-mode-class-pairs': ['error', {
  mappings: {
    'custom-light': 'custom-dark',
    'brand-primary': 'brand-primary-dark',
  },
}]
```

#### Dynamic classes causing warnings

**Problem:** Dynamic class names trigger warnings.

**Solution:** Use predefined class maps instead of template literals:

```javascript
// Instead of this:
const color = `text-${shade}-500`;

// Do this:
const colors = {
  red: 'text-red-500 dark:text-red-400',
  blue: 'text-blue-500 dark:text-blue-400',
};
const color = colors[shade];
```

### Error Messages

| Message                                                  | Meaning                                                             | Solution                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| `Missing dark mode pair`                                 | A Tailwind color class doesn't have a corresponding `dark:` variant | Add the suggested dark mode class or run `--fix`      |
| `Mismatched dark mode value`                             | The dark mode variant exists but has an unexpected value            | Update the dark variant to match the expected mapping |
| `Could not verify dark mode pairs in dynamic expression` | The plugin can't analyze dynamic class names                        | Use static class names or predefined class maps       |

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tdhuan/eslint-plugin-tailwind-dark-mode.git
cd eslint-plugin-tailwind-dark-mode

# Install dependencies
yarn install

# Run tests
yarn test

# Build the plugin
yarn build

# Link for local testing
yarn link
```

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com) for the amazing utility-first CSS framework
- [ESLint](https://eslint.org) for the powerful linting platform

**[⬆ back to top](#eslint-plugin-tailwind-dark-mode)**

Made with ❤️
