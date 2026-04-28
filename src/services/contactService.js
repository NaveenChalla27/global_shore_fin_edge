// Business logic for contact details.
import {readJson, writeJson} from "../store/jsonStore.js";
import {CONTACTS_FILE} from "../config/paths.js";

export async function getContacts() {
    return readJson(CONTACTS_FILE, {});
}

export async function updateContacts(patch) {
    const next = {...(await getContacts()), ...patch};
    await writeJson(CONTACTS_FILE, next);
    return next;
}
