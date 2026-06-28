import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/ott-dost-logo.png";
const OUT = "public/icons";

await mkdir(OUT, { recursive: true });

// Sample the top-left corner to match the logo's background so square
// padding blends seamlessly instead of showing a visible box.
const { data, info } = await sharp(SRC)
  .extract({ left: 1, top: 1, width: 1, height: 1 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const [r, g, b] = data;
const bg = { r, g, b, alpha: 1 };
console.log(`background sampled: rgb(${r}, ${g}, ${b}) channels=${info.channels}`);

const meta = await sharp(SRC).metadata();
const side = Math.max(meta.width, meta.height);

// Square base: center the logo on a square canvas filled with its own bg color.
const squareBase = await sharp({
  create: { width: side, height: side, channels: 4, background: bg },
})
  .composite([{ input: SRC, gravity: "center" }])
  .png()
  .toBuffer();

async function resize(buf, size, name) {
  await sharp(buf)
    .resize(size, size, { fit: "contain", background: bg })
    .png()
    .toFile(`${OUT}/${name}`);
  console.log(`wrote ${OUT}/${name} (${size}x${size})`);
}

// Standard "any" icons.
await resize(squareBase, 192, "icon-192.png");
await resize(squareBase, 512, "icon-512.png");

// Apple touch icon.
await resize(squareBase, 180, "apple-icon-180.png");

// Maskable: extra margin so the logo stays inside Android's safe zone
// (centre 80%) when the launcher crops it into a circle/squircle.
const maskCanvas = Math.round(side / 0.8);
const maskableBase = await sharp({
  create: { width: maskCanvas, height: maskCanvas, channels: 4, background: bg },
})
  .composite([{ input: squareBase, gravity: "center" }])
  .png()
  .toBuffer();
await resize(maskableBase, 512, "maskable-512.png");

console.log("done");
