
import {randomUUID} from "node:crypto";
import {readJson, writeJson} from "../store/jsonStore.js";
import {TESTIMONIALS_FILE} from "../config/paths.js";
import {HttpError} from "../utils/HttpError.js";

async function readAll() {
    const data = await readJson(TESTIMONIALS_FILE, {testimonials: []});
    return Array.isArray(data.testimonials) ? data.testimonials : [];
}

async function writeAll(testimonials) {
    await writeJson(TESTIMONIALS_FILE, {testimonials});
}

export async function listTestimonials() {
    const items = await readAll();
    return [...items].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getTestimonial(id) {
    const items = await readAll();
    const found = items.find((t) => t.id === id);
    if (!found) throw new HttpError(404, `Testimonial '${id}' not found`);
    return found;
}

export async function createTestimonial(input) {
    const items = await readAll();
    const id = input.id ?? randomUUID();
    if (items.some((t) => t.id === id)) {
        throw new HttpError(409, `Testimonial '${id}' already exists`);
    }
    const item = {
        id,
        text: input.text,
        name: input.name,
        meta: input.meta ?? "",
        initials: input.initials ?? input.name?.slice(0, 2).toUpperCase() ?? "",
        rating: input.rating ?? 5,
        publishedAt: input.publishedAt ?? new Date().toISOString().slice(0, 10),
    };
    items.push(item);
    await writeAll(items);
    return item;
}

export async function updateTestimonial(id, patch) {
    const items = await readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) throw new HttpError(404, `Testimonial '${id}' not found`);
    items[idx] = {...items[idx], ...patch, id: items[idx].id};
    await writeAll(items);
    return items[idx];
}

export async function removeTestimonial(id) {
    const items = await readAll();
    const next = items.filter((t) => t.id !== id);
    if (next.length === items.length) throw new HttpError(404, `Testimonial '${id}' not found`);
    await writeAll(next);
}
