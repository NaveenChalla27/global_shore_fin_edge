import {readFile, writeFile, mkdir} from "node:fs/promises";
import {existsSync} from "node:fs";
import {dirname, basename} from "node:path";
import {MongoClient} from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB || "edge-service";

// ---------------------------------------------------------------------------
// MongoDB connection — one cached client reused across warm invocations.
// ---------------------------------------------------------------------------
let _client = null;

async function getDb() {
    if (!_client) {
        _client = new MongoClient(MONGODB_URI);
        await _client.connect();
    }
    return _client.db(DB_NAME);
}

// Each JSON file maps to its own MongoDB collection.
// e.g. "bookings.json" → collection "bookings", document _id "data"
function collectionName(file) {
    return basename(file, ".json"); // "bookings", "contacts", etc.
}

export async function readJson(file, fallback) {
    // --- Mode 1: MongoDB — one collection per data type ---
    if (MONGODB_URI) {
        try {
            const db = await getDb();
            const doc = await db.collection(collectionName(file)).findOne({_id: "data"});
            if (doc) {
                const {_id, ...data} = doc;
                return data;
            }
        } catch (err) {
            console.error(`[store] MongoDB read failed for '${collectionName(file)}':`, err.message);
        }
        return fallback;
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
        try {
            const db = await getDb();
            await db.collection(collectionName(file)).replaceOne(
                {_id: "data"},
                {_id: "data", ...value},
                {upsert: true}
            );
        } catch (err) {
            console.error(`[store] MongoDB write failed for '${collectionName(file)}':`, err.message);
            throw err;
        }
        return;
    }

    // --- Mode 2: Filesystem ---
    const dir = dirname(file);
    if (!existsSync(dir)) await mkdir(dir, {recursive: true});
    await writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// seedDatabase — loads bundled JSON files into MongoDB on first deploy.
// Called once at startup; skips any collection that already has data.
// ---------------------------------------------------------------------------
export async function seedDatabase(files) {
    if (!MONGODB_URI) return;
    try {
        const db = await getDb();
        for (const file of files) {
            const name = collectionName(file);
            const exists = await db.collection(name).findOne({_id: "data"});
            if (exists) {
                console.log(`[seed] '${name}' already in MongoDB — skipped`);
                continue;
            }
            try {
                const data = JSON.parse(await readFile(file, "utf8"));
                await db.collection(name).insertOne({_id: "data", ...data});
                console.log(`[seed] '${name}' loaded into MongoDB`);
            } catch (err) {
                console.warn(`[seed] could not seed '${name}':`, err.message);
            }
        }
    } catch (err) {
        console.error("[seed] MongoDB seed failed:", err.message);
    }
}

