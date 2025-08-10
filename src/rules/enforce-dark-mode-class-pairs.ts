import type { Rule } from 'eslint';
import type { DarkModeConfig } from '../types';
import {
  // parseClassString,
  findClassPairs,
  buildDarkModeClass,
  // getBaseClass,
} from '../utils/class-parser';
import {
  DEFAULT_PROPERTIES,
  getDarkModeValue,
  needsDarkModePair,
} from '../utils/dark-mode-mappings';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce paired dark mode classes for Tailwind CSS',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/tdhuan/eslint-plugin-tailwind-dark-mode',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          properties: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_PROPERTIES,
          },
          mappings: {
            type: 'object',
            additionalProperties: { type: 'string' },
            default: {},
          },
          autofix: {
            type: 'boolean',
            default: true,
          },
          severity: {
            type: 'string',
            enum: ['error', 'warn'],
            default: 'error',
          },
          customPrefixes: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingDarkMode:
        'Missing dark mode pair for "{{className}}". Expected: "{{expected}}"',
      mismatchedDarkMode:
        'Mismatched dark mode value for "{{className}}". Expected "{{expected}}" but found "{{actual}}"',
      dynamicExpression:
        'Could not verify dark mode pairs in dynamic expression',
    },
  },

  create(context) {
    const options: DarkModeConfig = context.options[0] || {};
    const properties = options.properties || DEFAULT_PROPERTIES;
    const customMappings = options.mappings || {};
    const autofix = options.autofix !== false;

    /**
     * Check a string literal for dark mode violations
     */
    function checkStringLiteral(node: any, value: string, isTemplate = false) {
      // Skip if it contains template expressions
      if (isTemplate && value.includes('${')) {
        context.report({
          node,
          messageId: 'dynamicExpression',
        });
        return;
      }

      const pairs = findClassPairs(value, properties);
      const violations: Array<{
        className: string;
        expected: string;
        actual?: string;
        type: 'missing' | 'mismatched';
      }> = [];

      pairs.forEach((pair, baseClass) => {
        if (!pair.light || !pair.light.value) return;

        const lightValue = pair.light.value;
        if (!needsDarkModePair(lightValue)) return;

        const expectedDarkValue = getDarkModeValue(lightValue, customMappings);
        if (!expectedDarkValue) return;

        if (!pair.dark) {
          // Missing dark mode class
          violations.push({
            className: baseClass,
            expected: buildDarkModeClass(baseClass, expectedDarkValue),
            type: 'missing',
          });
        } else if (pair.dark.value !== expectedDarkValue) {
          // Mismatched dark mode value
          violations.push({
            className: baseClass,
            expected: buildDarkModeClass(baseClass, expectedDarkValue),
            actual: pair.dark.full,
            type: 'mismatched',
          });
        }
      });

      // Apply all fixes and report violations
      if (violations.length > 0) {
        let newValue = value;

        // Apply all fixes to create the corrected string
        violations.forEach((violation) => {
          if (violation.type === 'missing') {
            // Add missing dark mode class
            newValue = `${newValue} ${violation.expected}`;
          } else if (violation.type === 'mismatched' && violation.actual) {
            // Replace mismatched dark mode class
            newValue = newValue.replace(violation.actual, violation.expected);
          }
        });

        // Report each violation
        violations.forEach((violation, index) => {
          const report: Rule.ReportDescriptor = {
            node,
            messageId:
              violation.type === 'missing'
                ? 'missingDarkMode'
                : 'mismatchedDarkMode',
            data: {
              className: violation.className,
              expected: violation.expected,
              actual: violation.actual,
            },
          };

          // Add fix only to the first violation to avoid conflicts
          if (autofix && index === 0) {
            report.fix = (fixer) => {
              if (isTemplate) {
                return fixer.replaceText(node, `\`${newValue}\``);
              }
              return fixer.replaceText(node, `"${newValue}"`);
            };
          }

          context.report(report);
        });
      }
    }

    /**
     * Check JSX className attribute
     */
    function checkJSXAttribute(node: any) {
      if (node.name.name !== 'className') return;

      const value = node.value;
      if (!value) return;

      // Handle string literal
      if (value.type === 'Literal' && typeof value.value === 'string') {
        checkStringLiteral(value, value.value);
      }
      // Handle template literal
      else if (value.type === 'JSXExpressionContainer') {
        const expr = value.expression;
        if (expr.type === 'TemplateLiteral' && expr.expressions.length === 0) {
          const str = expr.quasis[0]?.value.raw || '';
          checkStringLiteral(expr, str, true);
        }
        // Handle simple string literal in JSX expression
        else if (expr.type === 'Literal' && typeof expr.value === 'string') {
          checkStringLiteral(expr, expr.value);
        }
      }
    }

    /**
     * Check function calls to classnames/clsx
     */
    function checkClassnamesCall(node: any) {
      const callee = node.callee;
      if (
        callee.type !== 'Identifier' ||
        !['classnames', 'clsx', 'cn'].includes(callee.name)
      ) {
        return;
      }

      // Check string literal arguments
      node.arguments.forEach((arg: any) => {
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          checkStringLiteral(arg, arg.value);
        }
        // Handle template literals
        else if (
          arg.type === 'TemplateLiteral' &&
          arg.expressions.length === 0
        ) {
          const str = arg.quasis[0]?.value.raw || '';
          checkStringLiteral(arg, str, true);
        }
      });
    }

    return {
      // Check JSX className attributes
      JSXAttribute: checkJSXAttribute,

      // Check function calls (classnames, clsx, etc.)
      CallExpression: checkClassnamesCall,

      // Check regular string assignments to className
      AssignmentExpression(node: any) {
        if (
          node.left.type === 'MemberExpression' &&
          node.left.property.name === 'className' &&
          node.right.type === 'Literal' &&
          typeof node.right.value === 'string'
        ) {
          checkStringLiteral(node.right, node.right.value);
        }
      },

      // Check template literals in variable declarations
      VariableDeclarator(node: any) {
        if (node.init) {
          // Check template literals
          if (node.init.type === 'TemplateLiteral') {
            if (node.init.expressions.length === 0) {
              // Simple template literal with no expressions
              const str = node.init.quasis[0]?.value.raw || '';
              checkStringLiteral(node.init, str, true);
            } else {
              // Template literal with expressions
              context.report({
                node: node.init,
                messageId: 'dynamicExpression',
              });
            }
          }
          // Check string literals
          else if (
            node.init.type === 'Literal' &&
            typeof node.init.value === 'string'
          ) {
            checkStringLiteral(node.init, node.init.value);
          }
        }
      },
    };
  },
};

export default rule;
