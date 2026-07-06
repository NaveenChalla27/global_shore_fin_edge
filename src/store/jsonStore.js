import {readFile, writeFile, mkdir} from "node:fs/promises";
import {existsSync} from "node:fs";
import {dirname, basename} from "node:path";
import {MongoClient} from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB || "edge-service";
const STORE_COLLECTION = "store";

// ---------------------------------------------------------------------------
// MongoDB connection — cached so the same TCP connection is reused across
// warm serverless invocations (avoids per-request handshake overhead).
// ---------------------------------------------------------------------------
let _client = null;

async function getCollection() {
    if (!_client) {
        _client = new MongoClient(MONGODB_URI);
        await _client.connect();
    }
    return _client.db(DB_NAME).collection(STORE_COLLECTION);
}

// ---------------------------------------------------------------------------
// In-memory fallback — used when MONGODB_URI is not set at all.
// Seeds from bundled JSON files; writes visible within the same warm instance.
// ---------------------------------------------------------------------------
const memCache = new Map();

async function memRead(file, fallback) {
    const key = basename(file);
    if (!memCache.has(key)) {
        try {
            memCache.set(key, JSON.parse(await readFile(file, "utf8")));
        } catch {
            memCache.set(key, fallback);
        }
    }
    return memCache.get(key);
}

// _id in MongoDB = filename without extension  e.g. "bookings", "contacts"
function docId(file) {
    return basename(file, ".json");
}

export async function readJson(file, fallback) {
    // --- Mode 1: MongoDB (works both locally and on Vercel when URI is set) ---
    if (MONGODB_URI) {
        try {
            const col = await getCollection();
            const doc = await col.findOne({_id: docId(file)});
            if (doc) {
                const {_id, ...data} = doc;
                return data;
            }
        } catch {
            // fall through to bundled seed file
        }
        // First read — seed data from bundled JSON file
        try {
            return JSON.parse(await readFile(file, "utf8"));
        } catch {
            return fallback;
        }
    }

    // --- Mode 2: Filesystem (local dev without MONGODB_URI) ---
    try {
        return JSON.parse(await readFile(file, "utf8"));
    } catch {
        return fallback;
    }
}

export async function writeJson(file, value) {
    // --- Mode 1: MongoDB ---
    if (MONGODB_URI) {
        const col = await getCollection();
        await col.replaceOne(
            {_id: docId(file)},
            {_id: docId(file), ...value},
            {upsert: true}
        );
        return;
    }

    // --- Mode 2: Filesystem ---
    const dir = dirname(file);
    if (!existsSync(dir)) await mkdir(dir, {recursive: true});
    await writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// seedDatabase — loads bundled JSON files into MongoDB on first deploy.
// Called once at startup; skips any collection that already has a document.
// ---------------------------------------------------------------------------
export async function seedDatabase(files) {
    if (!MONGODB_URI) return; // filesystem mode — nothing to seed
    try {
        const col = await getCollection();
        for (const file of files) {
            const id = docId(file);
            const exists = await col.findOne({_id: id});
            if (exists) {
                console.log(`[seed] '${id}' already in MongoDB — skipped`);
                continue;
            }
            try {
                const data = JSON.parse(await readFile(file, "utf8"));
                await col.insertOne({_id: id, ...data});
                console.log(`[seed] '${id}' loaded into MongoDB`);
            } catch (err) {
                console.warn(`[seed] could not seed '${id}':`, err.message);
            }
        }
    } catch (err) {
        console.error("[seed] MongoDB seed failed:", err.message);
    }
}
