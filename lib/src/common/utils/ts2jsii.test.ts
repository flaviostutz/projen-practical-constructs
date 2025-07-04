import * as fs from 'node:fs';
// eslint-disable-next-line unicorn/import-style
import { join } from 'node:path';

import { isUnionTypeReference } from '@jsii/spec';

import { tsToJsii } from './ts2jsii';

const TMP_FILE = join(__dirname, 'tmp-test-types.ts');

const writeTmp = (content: string): void => {
  fs.writeFileSync(TMP_FILE, content);
};

const cleanupTmp = (): void => {
  if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
};

describe('tsToJsii', () => {
  afterEach(() => {
    cleanupTmp();
  });

  it('extracts properties from an interface', () => {
    writeTmp(`
      export interface Foo {
        bar: string;
        baz?: number;
      }
    `);
    const result = tsToJsii(TMP_FILE, 'Foo');
    expect(result.properties).toEqual([
      expect.objectContaining({ name: 'bar', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'baz', optional: true, type: { primitive: 'number' } }),
    ]);
  });

  it('extracts properties from a type alias', () => {
    writeTmp(`
      export type Bar = {
        x: boolean;
        y?: string[];
      }
    `);
    const result = tsToJsii(TMP_FILE, 'Bar');
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
    writeTmp(`export interface Baz { foo: number; }`);
    expect(() => tsToJsii(TMP_FILE, 'NotFound')).toThrow(/not found/);
  });

  it('throws if filePath or typeName missing', () => {
    expect(() => tsToJsii('', 'Foo')).toThrow(/required/);
    expect(() => tsToJsii(TMP_FILE, '')).toThrow(/required/);
  });

  it('handles union and intersection types', () => {
    writeTmp(`
      export interface U {
        a: string | number;
        b: { foo: string } & { bar: number };
      }
    `);
    const result = tsToJsii(TMP_FILE, 'U');
    expect(result.properties && isUnionTypeReference(result.properties[0].type)).toBeTruthy();
    expect(result.properties && isUnionTypeReference(result.properties[1].type)).toBeTruthy();
  });
it('extracts properties from SpikeType, SpikeParent, and SpikeComplex', () => {
    writeTmp(`
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
    `);

    const spikeType = tsToJsii(TMP_FILE, 'SpikeType');
    expect(spikeType.properties).toEqual([
      expect.objectContaining({ name: 'prop1', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'prop2', optional: false, type: { primitive: 'number' } }),
      expect.objectContaining({ name: 'prop3', optional: true, type: { primitive: 'number' } }),
    ]);

    const spikeParent = tsToJsii(TMP_FILE, 'SpikeParent');
    expect(spikeParent.properties).toEqual([
      expect.objectContaining({ name: 'prop1', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'prop2', optional: true, type: { primitive: 'number' } }),
      expect.objectContaining({ name: 'prop3', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'prop4', optional: true, type: { fqn: 'SpikeComplex' } }),
    ]);

    const spikeComplex = tsToJsii(TMP_FILE, 'SpikeComplex');
    expect(spikeComplex.properties).toEqual([
      expect.objectContaining({ name: 'propa', optional: false, type: { primitive: 'string' } }),
      expect.objectContaining({ name: 'propb', optional: true, type: { primitive: 'number' } }),
    ]);
  });
});
