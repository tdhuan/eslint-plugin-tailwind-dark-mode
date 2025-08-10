import type { ParsedClass } from '../types';
import { needsDarkModePair } from './dark-mode-mappings';

/**
 * Parse a single Tailwind class into its components
 */
export function parseClass(className: string): ParsedClass | null {
  const trimmed = className.trim();
  if (!trimmed) return null;

  // Match pattern: [modifier:]property-value
  const match = trimmed.match(/^(?:([^:]+):)?([a-z]+)(?:-(.+))?$/);
  if (!match) return null;

  const [full, modifier, property, value] = match;

  return {
    full,
    modifier: modifier || undefined,
    property,
    value: value || undefined,
  };
}

/**
 * Extract classes from a string (handles various formats)
 */
export function extractClasses(input: string): string[] {
  // Remove comments and normalize whitespace
  const cleaned = input
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*/g, '') // Remove line comments
    .replace(/\s+/g, ' ')
    .trim();

  // Split by whitespace and filter empty strings
  return cleaned.split(/\s+/).filter(Boolean);
}

/**
 * Parse a className string and return structured class information
 */
export function parseClassString(classString: string): ParsedClass[] {
  const classes = extractClasses(classString);
  return classes
    .map(parseClass)
    .filter((parsed): parsed is ParsedClass => parsed !== null);
}

/**
 * Check if a parsed class is a dark mode variant
 */
export function isDarkModeClass(parsed: ParsedClass): boolean {
  return parsed.modifier === 'dark';
}

/**
 * Get the base class without dark modifier
 */
export function getBaseClass(parsed: ParsedClass): string {
  if (!parsed.property) return '';
  return parsed.value ? `${parsed.property}-${parsed.value}` : parsed.property;
}

/**
 * Build a dark mode class from a base class
 */
export function buildDarkModeClass(
  baseClass: string,
  darkValue: string
): string {
  // Parse the base class to get the property
  const parsed = parseClass(baseClass);
  if (parsed && parsed.property) {
    return `dark:${parsed.property}-${darkValue}`;
  }
  return `dark:${baseClass}`;
}

/**
 * Find class pairs (light and dark variants) in a class string
 */
export function findClassPairs(
  classString: string,
  properties: string[]
): Map<string, { light?: ParsedClass; dark?: ParsedClass }> {
  const parsed = parseClassString(classString);
  const pairs = new Map<string, { light?: ParsedClass; dark?: ParsedClass }>();

  // First pass: collect all light classes
  for (const cls of parsed) {
    if (!cls.property || !properties.includes(cls.property)) {
      continue;
    }

    const isDark = isDarkModeClass(cls);

    if (!isDark && !cls.modifier) {
      // This is a light class
      const baseClass = getBaseClass(cls);
      if (!pairs.has(baseClass)) {
        pairs.set(baseClass, {});
      }
      pairs.get(baseClass)!.light = cls;
    }
  }

  // Second pass: match dark classes with their light counterparts
  for (const cls of parsed) {
    if (!cls.property || !properties.includes(cls.property)) {
      continue;
    }

    const isDark = isDarkModeClass(cls);

    if (isDark) {
      // This is a dark class, find its light counterpart
      const darkProperty = cls.property;

      // Look for a light class with the same property that needs a dark mode pair
      for (const [, pair] of pairs.entries()) {
        if (
          pair.light &&
          pair.light.property === darkProperty &&
          pair.light.value &&
          needsDarkModePair(pair.light.value) &&
          !pair.dark
        ) {
          pair.dark = cls;
          break;
        }
      }
    }
  }

  return pairs;
}
