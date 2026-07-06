// Bootstrap. Exports the app for Vercel serverless; also starts a local server.
import "dotenv/config";
import {createApp} from "./src/app.js";
import {PORT, BOOKINGS_FILE, CONTACTS_FILE, COUNTRIES_FILE, POSTS_FILE, TESTIMONIALS_FILE} from "./src/config/paths.js";
import {seedDatabase} from "./src/store/jsonStore.js";

const app = createApp();

// Seed MongoDB with bundled JSON data on first deploy (no-op if already seeded).
seedDatabase([BOOKINGS_FILE, CONTACTS_FILE, COUNTRIES_FILE, POSTS_FILE, TESTIMONIALS_FILE]);

// Vercel sets VERCEL=1 automatically — skip listen() in that environment.
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`[edge-service] listening on http://localhost:${PORT}`);
        console.log(`[edge-service] docs:       http://localhost:${PORT}/docs`);
    });
}

export default app;
