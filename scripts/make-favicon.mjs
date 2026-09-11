// Generates app/icon.png and app/favicon.ico from Mort's Minecraft skin.
// Usage: node scripts/make-favicon.mjs <skin.png>
import sharp from "sharp";
import { writeFileSync } from "fs";

const skinPath = process.argv[2] ?? "mort-skin.png";

// Head face is at (8,8) 8x8; hat overlay layer is at (40,8) 8x8.
const face = await sharp(skinPath).extract({ left: 8, top: 8, width: 8, height: 8 }).png().toBuffer();
const hat = await sharp(skinPath).extract({ left: 40, top: 8, width: 8, height: 8 }).png().toBuffer();

const head8 = await sharp(face)
  .composite([{ input: hat }])
  .png()
  .toBuffer();

const upscale = (size) =>
  sharp(head8).resize(size, size, { kernel: "nearest" }).png().toBuffer();

writeFileSync("app/icon.png", await upscale(64));

// Build a single-image ICO containing a 32x32 PNG (supported by all modern browsers).
const png32 = await upscale(32);
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // data size
header.writeUInt32LE(22, 18); // data offset
writeFileSync("app/favicon.ico", Buffer.concat([header, png32]));

console.log("Wrote app/icon.png (64x64) and app/favicon.ico (32x32)");
