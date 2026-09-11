declare module "skyhelper-networth/helper/decode" {
  /** Decodes gzipped base64 NBT inventory strings into arrays of raw item objects (empty slots are {}). */
  export function decodeItems(base64Strings: string[]): Promise<any[][]>;
  export function decodeItem(encodedItem: Buffer): Promise<any>;
}
