// Filesystem paths for the JSON-backed data store.
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = join(__dirname, "..", "..");
export const DATA_DIR = join(ROOT_DIR, "data");

export const COUNTRIES_FILE = join(DATA_DIR, "countries.json");
export const CONTACTS_FILE = join(DATA_DIR, "contacts.json");
export const POSTS_FILE = join(DATA_DIR, "posts.json");
export const BOOKINGS_FILE = join(DATA_DIR, "bookings.json");
export const SPEC_FILE = join(ROOT_DIR, "openapi.yaml");
export const TESTIMONIALS_FILE = join(DATA_DIR, "testimonials.json");

export const PORT = Number(process.env.PORT) || 4000;
