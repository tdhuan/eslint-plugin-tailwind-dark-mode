/**
 * Default mappings for Tailwind color values from light to dark mode
 */
export const DEFAULT_MAPPINGS: Record<string, string> = {
  // Neutral colors
  'neutral-50': 'neutral-950',
  'neutral-100': 'neutral-900',
  'neutral-200': 'neutral-800',
  'neutral-300': 'neutral-700',
  'neutral-400': 'neutral-600',
  'neutral-500': 'neutral-500',
  'neutral-600': 'neutral-400',
  'neutral-700': 'neutral-300',
  'neutral-800': 'neutral-200',
  'neutral-900': 'neutral-100',
  'neutral-950': 'neutral-50',

  // Slate colors
  'slate-50': 'slate-950',
  'slate-100': 'slate-900',
  'slate-200': 'slate-800',
  'slate-300': 'slate-700',
  'slate-400': 'slate-600',
  'slate-500': 'slate-500',
  'slate-600': 'slate-400',
  'slate-700': 'slate-300',
  'slate-800': 'slate-200',
  'slate-900': 'slate-100',
  'slate-950': 'slate-50',

  // Gray colors
  'gray-50': 'gray-950',
  'gray-100': 'gray-900',
  'gray-200': 'gray-800',
  'gray-300': 'gray-700',
  'gray-400': 'gray-600',
  'gray-500': 'gray-500',
  'gray-600': 'gray-400',
  'gray-700': 'gray-300',
  'gray-800': 'gray-200',
  'gray-900': 'gray-100',
  'gray-950': 'gray-50',

  // Zinc colors
  'zinc-50': 'zinc-950',
  'zinc-100': 'zinc-900',
  'zinc-200': 'zinc-800',
  'zinc-300': 'zinc-700',
  'zinc-400': 'zinc-600',
  'zinc-500': 'zinc-500',
  'zinc-600': 'zinc-400',
  'zinc-700': 'zinc-300',
  'zinc-800': 'zinc-200',
  'zinc-900': 'zinc-100',
  'zinc-950': 'zinc-50',

  // Special values
  white: 'black',
  black: 'white',
  transparent: 'transparent',
};

/**
 * Default properties to check for dark mode pairs
 */
export const DEFAULT_PROPERTIES = [
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
];

/**
 * Get the dark mode equivalent for a light mode value
 */
export function getDarkModeValue(
  lightValue: string,
  customMappings?: Record<string, string>
): string | undefined {
  const mappings = { ...DEFAULT_MAPPINGS, ...customMappings };
  return mappings[lightValue];
}

/**
 * Check if a value needs a dark mode pair
 */
export function needsDarkModePair(value: string): boolean {
  // Values that don't need dark mode pairs
  const exemptValues = ['current', 'inherit', 'transparent'];
  if (exemptValues.includes(value)) {
    return false;
  }

  // Check if it's a color value
  const colorPattern =
    /^(neutral|slate|gray|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-/;
  return colorPattern.test(value) || value === 'white' || value === 'black';
}
