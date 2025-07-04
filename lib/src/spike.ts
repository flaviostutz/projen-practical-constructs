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
