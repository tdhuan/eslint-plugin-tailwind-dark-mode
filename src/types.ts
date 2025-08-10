export interface DarkModeConfig {
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

export interface ClassPair {
  property: string;
  lightValue: string;
  darkValue?: string;
  position: {
    start: number;
    end: number;
  };
}

export interface ParsedClass {
  full: string;
  modifier?: string;
  property?: string;
  value?: string;
}
