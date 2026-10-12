import path from "node:path";
import { createRequire } from "node:module";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const BUILD = path.join(ROOT, "docs/demo/build");
export const OUT = path.join(ROOT, "docs/demo");

// ffmpeg: a system install if present, else the ffmpeg-static / ffprobe-static npm packages
// (installed outside the project: DEMO_TOOLS=<dir with node_modules/ffmpeg-static>).
function tool(name, pkg, pick) {
  if (process.env.DEMO_TOOLS) {
    const req = createRequire(path.join(process.env.DEMO_TOOLS, "package.json"));
    return pick(req(pkg));
  }
  return name;
}
export const FFMPEG = tool("ffmpeg", "ffmpeg-static", (m) => m);
export const FFPROBE = tool("ffprobe", "ffprobe-static", (m) => m.path);

// Canvas layout (1920x1080): the phone recording sits centered, captions live in the bottom strip.
export const CANVAS = { w: 1920, h: 1080 };
export const PHONE = { w: 416, h: 900, x: (1920 - 416) / 2, y: 28 };
export const FRAME_PAD = 14;
export const CAPTION_TOP = 960;
