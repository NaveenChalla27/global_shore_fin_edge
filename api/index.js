// /api/index.js
import { createApp } from "../src/app.js";
import { BOOKINGS_FILE, CONTACTS_FILE, COUNTRIES_FILE, POSTS_FILE, TESTIMONIALS_FILE } from "../src/config/paths.js";
import { seedDatabase } from "../src/store/jsonStore.js";

let app;
let seeded = false;

export default async function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  if (!seeded) {
    seeded = true; // prevent concurrent seed attempts
    await seedDatabase([BOOKINGS_FILE, CONTACTS_FILE, COUNTRIES_FILE, POSTS_FILE, TESTIMONIALS_FILE]);
  }
  return app(req, res);
}
