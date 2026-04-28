import {readFile, writeFile, mkdir} from "node:fs/promises";
import {existsSync} from "node:fs";
import {dirname, basename, join} from "node:path";

// Vercel's function filesystem is read-only except for /tmp.
// Writes are redirected there; reads check /tmp first so in-request
// mutations are visible within the same invocation.
const isVercel = process.env.VERCEL === "1";
const TMP_DIR = "/tmp/edge-service-data";

function tmpPath(file) {
    return join(TMP_DIR, basename(file));
}

export async function readJson(file, fallback) {
    const candidates = isVercel ? [tmpPath(file), file] : [file];
    for (const candidate of candidates) {
        try {
            return JSON.parse(await readFile(candidate, "utf8"));
        } catch {
            // try next candidate
        }
    }
    return fallback;
}

export async function writeJson(file, value) {
    const target = isVercel ? tmpPath(file) : file;
    const dir = dirname(target);
    if (!existsSync(dir)) await mkdir(dir, {recursive: true});
    await writeFile(target, JSON.stringify(value, null, 2) + "\n", "utf8");
}
