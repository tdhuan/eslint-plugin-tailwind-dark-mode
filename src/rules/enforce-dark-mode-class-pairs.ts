import type { Rule } from 'eslint';
import type { DarkModeConfig } from '../types';
import { findClassesNeedingDark } from '../utils/class-parser';
import {
  DEFAULT_PROPERTIES,
  getDarkModeValue,
} from '../utils/dark-mode-mappings';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce dark mode variants for specific Tailwind CSS property groups',
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
      missingDarkMode: 'Missing dark mode variant for "{{className}}".',
      dynamicExpression:
        'Could not verify dark mode variants in dynamic expression',
    },
  },

  create(context) {
    const options: DarkModeConfig = context.options[0] || {};
    const properties = options.properties || DEFAULT_PROPERTIES;
    const autofix = options.autofix !== false;

    /**
     * Check if a string is likely to contain CSS classes
     */
    function isLikelyCSSClasses(str: string): boolean {
      if (!str || typeof str !== 'string') return false;

      // Skip obvious non-CSS patterns
      if (
        str.includes('://') ||
        str.includes('?') ||
        str.includes('&') ||
        str.includes('=')
      ) {
        return false;
      }

      // Look for typical Tailwind CSS class patterns
      const tailwindPatterns = [
        /\b(text|bg|border|shadow|ring|outline|divide|space|gap|rounded|p[lrbtxy]?|m[lrbtxy]?|w|h|min|max|flex|grid|justify|items|self|place|order|basis|grow|shrink|col|row|inset|top|right|bottom|left|z|opacity|scale|rotate|translate|skew|transform|transition|duration|ease|delay|animate|cursor|select|resize|scroll|appearance|will|filter|backdrop|accent|caret|decoration|list|whitespace|break|hyphens|content|sr)-/,
        /\bdark:/,
        /\b(sm|md|lg|xl|2xl):/,
        /\b(hover|focus|active|visited|target|focus-within|focus-visible|motion-safe|motion-reduce|print):/,
      ];

      return tailwindPatterns.some((pattern) => pattern.test(str));
    }

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

      const { lightClasses, hasDarkVariants } = findClassesNeedingDark(
        value,
        properties
      );
      const violations: Array<{
        className: string;
        expected: string;
        type: 'missing';
      }> = [];

      // Check each light class to see if there's a dark variant for its property group
      lightClasses.forEach((lightClass) => {
        if (!lightClass.property) return;

        // Check if there's any dark variant for this property group
        if (!hasDarkVariants.has(lightClass.property)) {
          // Generate proper dark variant using mapping
          let expectedDarkClass = `dark:${lightClass.full}`;

          if (lightClass.value) {
            const darkValue = getDarkModeValue(
              lightClass.value,
              options.mappings
            );
            if (darkValue) {
              expectedDarkClass = `dark:${lightClass.property}-${darkValue}`;
            }
          }

          violations.push({
            className: lightClass.full,
            expected: expectedDarkClass,
            type: 'missing',
          });
        }
      });

      // Apply all fixes and report violations
      if (violations.length > 0) {
        let newValue = value;

        // Apply all fixes to create the corrected string
        violations.forEach((violation) => {
          // Add missing dark mode class
          newValue = `${newValue} ${violation.expected}`;
        });

        // Report each violation
        violations.forEach((violation, index) => {
          const report: Rule.ReportDescriptor = {
            node,
            messageId: 'missingDarkMode',
            data: {
              className: violation.className,
              expected: violation.expected,
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

      // Check template literals in variable declarations (only if likely to be CSS classes)
      VariableDeclarator(node: any) {
        if (node.init) {
          // Check template literals
          if (node.init.type === 'TemplateLiteral') {
            if (node.init.expressions.length === 0) {
              // Simple template literal with no expressions
              const str = node.init.quasis[0]?.value.raw || '';
              // Only check if it looks like CSS classes (contains typical Tailwind patterns)
              if (isLikelyCSSClasses(str)) {
                checkStringLiteral(node.init, str, true);
              }
            } else {
              // Template literal with expressions - only report if it looks like CSS classes
              const allText = node.init.quasis
                .map((q: any) => q.value.raw)
                .join('');
              if (isLikelyCSSClasses(allText)) {
                context.report({
                  node: node.init,
                  messageId: 'dynamicExpression',
                });
              }
            }
          }
          // Check string literals
          else if (
            node.init.type === 'Literal' &&
            typeof node.init.value === 'string'
          ) {
            // Only check if it looks like CSS classes
            if (isLikelyCSSClasses(node.init.value)) {
              checkStringLiteral(node.init, node.init.value);
            }
          }
        }
      },
    };
  },
};

export default rule;
