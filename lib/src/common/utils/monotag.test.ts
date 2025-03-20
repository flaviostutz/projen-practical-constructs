/* eslint-disable no-undefined */
/* eslint-disable unicorn/no-useless-undefined */
import { MONOTAG_VERSION } from '../constants';
import { expandMonotagCmd, NextTagOptions } from '../types/monotag';

import { monotagCliArgs } from './monotag';

describe('monotagCliArgs', () => {
  it('returns an empty string when no options are provided', () => {
    const options: NextTagOptions = {};
    expect(monotagCliArgs(options)).toBe('');
  });

  it('includes a single arg when a single option is provided', () => {
    const options: NextTagOptions = { bumpAction: 'latest' };
    expect(monotagCliArgs(options)).toContain('--bump-action="latest"');
  });

  it('includes multiple args when multiple options are provided', () => {
    const options: NextTagOptions = {
      bumpAction: 'zero',
      gitEmail: 'test@example.com',
      gitUsername: 'testuser',
      bumpFiles: ['file1', 'file2'],
    };
    const args = monotagCliArgs(options);
    expect(args).toBe(
      '--bump-action="zero" --bump-files="file1,file2" --git-email="test@example.com" --git-username="testuser"',
    );
  });

  it('omits fields that are not defined', () => {
    const options: NextTagOptions = {
      gitEmail: 'test@example.com',
    };
    const args = monotagCliArgs(options);
    expect(args).toContain('--git-email="test@example.com"');
    expect(args).not.toContain('--bump-action=');
  });

  it('appends monotagExtraArgs if provided', () => {
    const options: NextTagOptions = {
      bumpAction: 'latest',
      monotagExtraArgs: '--foo "bar" --baz',
    };
    const args = monotagCliArgs(options);
    expect(args).toContain('--bump-action="latest"');
    expect(args).toContain('--foo "bar" --baz');
  });
});
describe('expandMonotagCmd', () => {
  it('returns default command when monotagCmd is undefined', () => {
    expect(expandMonotagCmd(undefined)).toBe(`npx -y monotag@${MONOTAG_VERSION}`);
  });

  it('returns the provided command when monotagCmd is set', () => {
    expect(expandMonotagCmd('my-custom-cli')).toBe('my-custom-cli');
  });
});
