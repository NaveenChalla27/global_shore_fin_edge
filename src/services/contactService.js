// Business logic for contact details — per-country support.
import {readJson, writeJson} from "../store/jsonStore.js";
import {CONTACTS_FILE} from "../config/paths.js";
import {readFile} from "node:fs/promises";

const FALLBACK = {
    default: {
        phone: "+1 (203) 435-3563",
        phoneHref: "tel:+12034353563",
        email: "support@globalshore.com",
        emailHref: "mailto:support@globalshore.com",
        hours: "Mon-Fri: 9AM - 7PM (MST)",
        whatsapp: "10000000000",
        address: "Hyderabad, India",
        socials: {linkedin: "#", twitter: "#", instagram: "#"},
    },
};

async function readAll() {
    const data = await readJson(CONTACTS_FILE, FALLBACK);
    // Re-seed if MongoDB has old flat format OR only has "default" (missing country entries)
    const countryKeys = Object.keys(data ?? {}).filter((k) => k !== "default");
    const needsReseed = !data || data.phone !== undefined || countryKeys.length === 0;
    if (needsReseed) {
        try {
            const fresh = JSON.parse(await readFile(CONTACTS_FILE, "utf8"));
            await writeJson(CONTACTS_FILE, fresh);
            return fresh;
        } catch {
            await writeJson(CONTACTS_FILE, FALLBACK);
            return FALLBACK;
        }
    }
    return data;
}

// Returns contacts for the given country code, falls back to "default".
export async function getContacts(countryCode) {
    const all = await readAll();
    if (countryCode && all[countryCode]) return all[countryCode];
    return all["default"] ?? all;
}

// Updates contacts for a specific country key (e.g. "US", "CA", "default").
export async function updateContacts(countryCode, patch) {
    const all = await readAll();
    const existing = all[countryCode] ?? all["default"] ?? {};
    const updated = {...existing, ...patch};
    const next = {...all, [countryCode]: updated};
    await writeJson(CONTACTS_FILE, next);
    return updated;
}
