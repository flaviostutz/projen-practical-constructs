/* eslint-disable no-restricted-syntax */
import { Project, TomlFile } from 'projen';

/**
 * ruff.toml synthetisation
 */
export class RuffTomlFile extends TomlFile {
  constructor(project: Project, opts?: RuffTomlFileOptions) {
    const optsWithDefaults = getOptionsWithDefaults(opts);
    super(project, 'ruff.toml', {
      obj: {
        'cache-dir': '.cache/.ruff_cache',
        'show-fixes': true,
        src: ['src', 'tests'],
        'target-version': optsWithDefaults.targetPythonVersion,
        'unsafe-fixes': optsWithDefaults.unsafeFixes,
        format: {
          'docstring-code-format': true,
        },
        lint: {
          ignore: optsWithDefaults.ignoreRules,
          select: optsWithDefaults.selectRules,
          mccabe: {
            'max-complexity': optsWithDefaults.mccabeMaxComplexity,
          },
          'per-file-ignores': optsWithDefaults.perFileIgnores,
        },
      },
    });
  }
}

const getOptionsWithDefaults = (opts?: RuffTomlFileOptions): Required<RuffTomlFileOptions> => {
  const defaultOptions = {
    unsafeFixes: false,
    targetPythonVersion: 'py313',
    ignoreRules: [
      'TD003',
      'TRY002',
      'TRY003',
      'D100',
      'D203',
      'D213',
      'D400',
      'D415',
      'COM812',
      'ISC001',
      'W191',
      'E111',
      'E114',
      'E117',
      'D206',
      'D300',
      'Q000',
      'Q001',
      'Q002',
      'Q003',
      'COM812',
      'COM819',
      'ISC001',
      'ISC002',
    ],
    selectRules: [
      'E',
      'F',
      'UP',
      'B',
      'SIM',
      'I',
      'W',
      'C90',
      'N',
      'D',
      'ASYNC',
      'ANN',
      'S',
      'FBT003',
      'A',
      'COM',
      'C4',
      'DTZ',
      'T10',
      'DJ',
      'EXE',
      'FA',
      'ISC',
      'ICN',
      'LOG',
      'G',
      'INP',
      'PIE',
      'T20',
      'PYI',
      'PT',
      'Q',
      'RSE',
      'RET',
      'SLF',
      'TC',
      'INT',
      'ARG',
      'PTH',
      'TD',
      'ERA',
      'PD',
      'PGH',
      'PL',
      'TRY',
      'FLY',
      'NPY',
      'FAST',
      'PERF',
      'FURB',
      'RUF',
    ],
    addToExistingRules: true,
    perFileIgnores: {
      'tests/*': ['D', 'S101'],
    },
    mccabeMaxComplexity: 14,
    ...opts,
  };

  // add provided rules to default rules
  if (defaultOptions.addToExistingRules) {
    defaultOptions.ignoreRules = [...defaultOptions.ignoreRules, ...(opts?.ignoreRules ?? [])];
    defaultOptions.selectRules = [...defaultOptions.selectRules, ...(opts?.selectRules ?? [])];
    defaultOptions.perFileIgnores = {
      ...defaultOptions.perFileIgnores,
      ...(opts?.perFileIgnores ?? {}),
    };
    // replace rules with the provided ones
  } else {
    defaultOptions.ignoreRules = opts?.ignoreRules ?? defaultOptions.ignoreRules;
    defaultOptions.selectRules = opts?.selectRules ?? defaultOptions.selectRules;
    defaultOptions.perFileIgnores = opts?.perFileIgnores ?? defaultOptions.perFileIgnores;
  }

  return defaultOptions;
};

export interface RuffTomlFileOptions {
  /**
   * @default py313
   */
  readonly targetPythonVersion?: string;
  /**
   * @default pre-selected set of rules
   */
  readonly ignoreRules?: string[];
  /**
   * Add rules defined here to the ignoreRules and selectRules (on top of the default rules) or replace them by this contents?
   * @default true
   */
  readonly addToExistingRules?: boolean;
  /**
   * @default pre-selected set of rules
   */
  readonly selectRules?: string[];
  /**
   * @default ignore doc-string code format for test files
   */
  readonly perFileIgnores?: Record<string, string[]>;
  /**
   * @default false
   */
  readonly unsafeFixes?: boolean;
  /**
   * @default 14
   */
  readonly mccabeMaxComplexity?: number;
}
