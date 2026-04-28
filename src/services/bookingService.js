// Business logic for consultation booking requests.
import {randomUUID} from "node:crypto";
import {readJson, writeJson} from "../store/jsonStore.js";
import {BOOKINGS_FILE} from "../config/paths.js";

async function readAll() {
    const data = await readJson(BOOKINGS_FILE, {bookings: []});
    return Array.isArray(data.bookings) ? data.bookings : [];
}

async function writeAll(bookings) {
    await writeJson(BOOKINGS_FILE, {bookings});
}

export async function listBookings() {
    const bookings = await readAll();
    return [...bookings].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export async function createBooking(input) {
    const bookings = await readAll();
    const booking = {
        id: randomUUID(),
        name: input.name,
        email: input.email,
        phone: input.phone ?? "",
        country: input.country ?? "",
        service: input.service ?? "",
        preferredAt: input.preferredAt ?? "",
        message: input.message ?? "",
        source: input.source ?? "website",
        createdAt: new Date().toISOString(),
    };
    bookings.push(booking);
    await writeAll(bookings);
    return booking;
}
