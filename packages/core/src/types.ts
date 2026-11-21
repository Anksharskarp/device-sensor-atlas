export interface Channel {
  readonly quantity: string;
  readonly unit: string;
  readonly clock: string;
  readonly axis?: string;
  readonly timestampKind?: "source" | "receipt";
}

export type Channels = Readonly<Record<string, Channel>>;

export interface Sample {
  readonly t: number;
  readonly value: number;
}

export interface Reading extends Sample {
  readonly segment: number;
}

export interface Run<K extends string = string> {
  readonly version: 1;
  readonly name: string;
  readonly channels: Readonly<Record<K, Channel>>;
  readonly samples: Readonly<Record<K, readonly Reading[]>>;
}
