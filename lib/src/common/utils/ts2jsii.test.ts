import * as fs from 'node:fs';
// eslint-disable-next-line unicorn/import-style
import * as path from 'node:path';

import { isUnionTypeReference } from '@jsii/spec';

import { tsToJsii } from './ts2jsii';

const TMP_DIR = fs.mkdtempSync('projen-practical-constructs-test-');

const writeTmp = (filename: string, content: string): string => {
  const tmpFile = path.join(TMP_DIR, filename);
  fs.writeFileSync(tmpFile, content);
  return tmpFile;
};

describe('tsToJsii', () => {
  afterAll(() => {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
  });

  it('extracts properties from an interface', () => {
    const tmpFile = writeTmp(
      'Foo.ts',
      `
      export interface Foo {
        bar: string;
        baz?: number;
      }
    `,
    );
    const result = tsToJsii(tmpFile, 'Foo');
    expect(result.properties).toEqual([
      expect.objectContaining({ name: 'bar', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'baz', optional: true, type: { primitive: 'number' } }),
    ]);
  });

  it('extracts properties from a type alias', () => {
    const tmpFile = writeTmp(
      'Bar.ts',
      `
      export type Bar = {
        x: boolean;
        y?: string[];
      }
    `,
    );
    const result = tsToJsii(tmpFile, 'Bar');
    expect(result.properties).toEqual([
      expect.objectContaining({ name: 'x', optional: false, type: { primitive: 'boolean' } }),
      expect.objectContaining({
        name: 'y',
        optional: true,
        type: { collection: { kind: 'array', elementtype: { primitive: 'string' } } },
      }),
    ]);
  });

  it('throws if type/interface not found', () => {
    const tmpFile = writeTmp(
      'Baz.ts',
      `
export interface Baz { foo: number; }`,
    );
    expect(() => tsToJsii(tmpFile, 'NotFound')).toThrow(/not found/);
    expect(() => tsToJsii(tmpFile, '')).toThrow(/required/);
  });

  it('throws if filePath is missing', () => {
    expect(() => tsToJsii('', 'Foo')).toThrow(/required/);
  });

  it('handles union and intersection types', () => {
    const tmpFile = writeTmp(
      'U.ts',
      `
      export interface U {
        a: string | number;
        b: { foo: string } & { bar: number };
      }
    `,
    );
    const result = tsToJsii(tmpFile, 'U');
    expect(result.properties && isUnionTypeReference(result.properties[0].type)).toBeTruthy();
    expect(result.properties && isUnionTypeReference(result.properties[1].type)).toBeTruthy();
  });
  it('extracts properties from SpikeType, SpikeParent, and SpikeComplex', () => {
    const tmpFile = writeTmp(
      'Spikes.ts',
      `
      export type SpikeType = {
        prop1: string;
        prop2: number;
        prop3?: number;
      };

      export type SpikeParent = {
        prop1: string;
        prop2?: number;
        prop3: string;
        prop4?: SpikeComplex;
      };

      export type SpikeComplex = {
        propa: string;
        propb?: number;
      };
    `,
    );

    const spikeType = tsToJsii(tmpFile, 'SpikeType');
    expect(spikeType.properties).toStrictEqual([
      { name: 'prop1', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'prop2', optional: false, type: { primitive: 'number' }, docs: {} },
      { name: 'prop3', optional: true, type: { primitive: 'number' }, docs: {} },
    ]);

    const spikeParent = tsToJsii(tmpFile, 'SpikeParent');
    expect(spikeParent.properties).toStrictEqual([
      { name: 'prop1', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'prop2', optional: true, type: { primitive: 'number' }, docs: {} },
      { name: 'prop3', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'prop4', optional: true, type: { fqn: '__type' }, docs: {} },
    ]);

    const spikeComplex = tsToJsii(tmpFile, 'SpikeComplex');
    expect(spikeComplex.properties).toStrictEqual([
      { name: 'propa', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'propb', optional: true, type: { primitive: 'number' }, docs: {} },
    ]);
  });

  it.only('extracts properties from SpikeType with inheritance', () => {
    const tmpFile = writeTmp(
      'SpikesMore.ts',
      `
      export type SpikeType = SpikeParent & {
        prop1: string;
        prop2: number;
        prop3?: number;
      };

      export type SpikeParent = {
        prop1: string;
        prop2?: number;
        prop3: string;
        prop4?: SpikeComplex;
      };

      export type SpikeComplex = {
        propa: string;
        propb?: number;
      };
    `,
    );

    const spikeType = tsToJsii(tmpFile, 'SpikeType');
    expect(spikeType.properties).toStrictEqual([
      { name: 'prop1', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'prop2', optional: false, type: { primitive: 'number' }, docs: {} },
      { name: 'prop3', optional: true, type: { primitive: 'number' }, docs: {} },
      { name: 'prop4', optional: true, type: { fqn: '__type' }, docs: {} },
    ]);
  });

  it('extracts properties from SpikeType with inheritance with Type Reference', () => {
    const tmpFile = writeTmp(
      'SpikesMore.ts',
      `
      export type SpikeType = SpikeParent & {
        prop1: string;
        prop2: number;
        prop3?: number;
      };

      export type SpikeParent = {
        prop1: string;
        prop2?: number;
        prop3: string;
        prop4?: SpikeComplex;
        prop5?: number;
      } & SpikeParent2;

      export type SpikeParent2 = {
        prop3?: boolean;
        prop5: string;
      };

      export type SpikeComplex = {
        propa: string;
        propb?: number;
      };
    `,
    );

    const spikeType = tsToJsii(tmpFile, 'SpikeType');
    expect(spikeType.properties).toStrictEqual([
      { name: 'prop1', optional: false, type: { primitive: 'string' }, docs: {} },
      { name: 'prop2', optional: false, type: { primitive: 'number' }, docs: {} },
      { name: 'prop3', optional: true, type: { primitive: 'number' }, docs: {} },
      { name: 'prop4', optional: true, type: { fqn: '__type' }, docs: {} },
      { name: 'prop5', optional: false, type: { primitive: 'string' }, docs: {} },
    ]);
  });
});
