export const defaultMaxBytes = 200_000_000;
export const bucket = "storytelling-videos";
export const formats = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
} as const;
export type Format = keyof typeof formats;

export function videoFormat(filename: string): Format | undefined {
  const ext = filename.split(".").at(-1)?.toLowerCase();
  if (
    filename.includes(".") &&
    (ext === "mp4" || ext === "mov" || ext === "webm")
  )
    return ext;
}

export function matchesVideoHeader(format: Format, bytes: Uint8Array) {
  if (bytes.length < 16) return false;
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  if (format === "webm") {
    return (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3 &&
      bytes
        .subarray(4, 4096)
        .some(
          (byte, i) =>
            byte === 0x42 &&
            bytes[i + 5] === 0x82 &&
            bytes[i + 6] === 0x84 &&
            ascii(i + 7, i + 11) === "webm",
        )
    );
  }
  if (ascii(4, 8) === "ftyp") {
    const major = ascii(8, 12);
    if (format === "mov") return major === "qt  ";
    // AVIF, HEIF and M4A also use ftyp boxes. Accept the common MP4 video brands.
    return /^(isom|iso[2-9]|mp4[12]|avc1|dash|M4V |MSNV|F4V )$/.test(major);
  }
  return (
    format === "mov" && ["moov", "mdat", "wide", "free"].includes(ascii(4, 8))
  );
}
