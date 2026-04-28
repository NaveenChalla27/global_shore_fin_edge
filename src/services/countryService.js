// Business logic for country + nested-service resources.
// Pure functions over the JSON store — no HTTP concerns here.
import {readJson, writeJson} from "../store/jsonStore.js";
import {COUNTRIES_FILE} from "../config/paths.js";
import {HttpError} from "../utils/HttpError.js";

const eq = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

async function loadAll() {
    return readJson(COUNTRIES_FILE, {countries: []});
}

async function saveAll(data) {
    await writeJson(COUNTRIES_FILE, data);
}

export async function listCountries() {
    return loadAll();
}

export async function getCountry(code) {
    const {countries} = await loadAll();
    const c = countries.find((x) => eq(x.code, code));
    if (!c) throw new HttpError(404, "Country not found");
    return c;
}

export async function createCountry(payload) {
    const data = await loadAll();
    if (data.countries.some((c) => eq(c.code, payload.code))) {
        throw new HttpError(409, `Country '${payload.code}' already exists`);
    }
    const next = {
        services: [],
        stats: [],
        trustBadges: [],
        status: "coming-soon",
        ...payload,
    };
    data.countries.push(next);
    await saveAll(data);
    return next;
}

export async function updateCountry(code, patch) {
    const data = await loadAll();
    const idx = data.countries.findIndex((c) => eq(c.code, code));
    if (idx === -1) throw new HttpError(404, "Country not found");
    data.countries[idx] = {
        ...data.countries[idx],
        ...patch,
        code: data.countries[idx].code, // immutable
    };
    await saveAll(data);
    return data.countries[idx];
}

export async function deleteCountry(code) {
    const data = await loadAll();
    const before = data.countries.length;
    data.countries = data.countries.filter((c) => !eq(c.code, code));
    if (data.countries.length === before) throw new HttpError(404, "Country not found");
    await saveAll(data);
}

function locateCountry(data, code) {
    const country = data.countries.find((c) => eq(c.code, code));
    if (!country) throw new HttpError(404, "Country not found");
    country.services = country.services || [];
    return country;
}

export async function addService(code, service) {
    const data = await loadAll();
    const country = locateCountry(data, code);
    if (country.services.some((s) => s.key === service.key)) {
        throw new HttpError(409, `Service '${service.key}' already exists`);
    }
    country.services.push(service);
    await saveAll(data);
    return service;
}

export async function updateService(code, key, patch) {
    const data = await loadAll();
    const country = locateCountry(data, code);
    const idx = country.services.findIndex((s) => s.key === key);
    if (idx === -1) throw new HttpError(404, "Service not found");
    country.services[idx] = {...country.services[idx], ...patch, key: country.services[idx].key};
    await saveAll(data);
    return country.services[idx];
}

export async function deleteService(code, key) {
    const data = await loadAll();
    const country = locateCountry(data, code);
    const before = country.services.length;
    country.services = country.services.filter((s) => s.key !== key);
    if (country.services.length === before) throw new HttpError(404, "Service not found");
    await saveAll(data);
}
