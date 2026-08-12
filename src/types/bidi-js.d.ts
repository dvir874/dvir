/* bidi-js ships no type declarations. Only the two functions we use. */
declare module "bidi-js" {
  interface BidiEmbeddingLevels {
    levels: Uint8Array;
    paragraphs: Array<{ start: number; end: number; level: number }>;
  }

  interface Bidi {
    getEmbeddingLevels(text: string, direction?: "ltr" | "rtl"): BidiEmbeddingLevels;
    getReorderSegments(
      text: string,
      embeddingLevels: BidiEmbeddingLevels,
      start?: number,
      end?: number,
    ): Array<[number, number]>;
  }

  export default function bidiFactory(): Bidi;
}
