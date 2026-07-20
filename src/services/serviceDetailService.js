import {readFile} from "node:fs/promises";
import {HttpError} from "../utils/HttpError.js";
import {join} from "node:path";
import {DATA_DIR} from "../config/paths.js";

const FILE = join(DATA_DIR, "serviceDetails.json");

// Always read from the static JSON file — service details are not stored in MongoDB.
async function getStore() {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw);
}

export async function listCategories() {
    const store = await getStore();
    return store.categories ?? [];
}

export async function getCategory(slug) {
    const categories = await listCategories();
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) throw new HttpError(404, `Service category '${slug}' not found`);
    return cat;
}

export async function getService(slug) {
    const categories = await listCategories();
    for (const cat of categories) {
        const svc = (cat.services ?? []).find((s) => s.slug === slug);
        if (svc) return svc;
    }
    throw new HttpError(404, `Service '${slug}' not found`);
}
