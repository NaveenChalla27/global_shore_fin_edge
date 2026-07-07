// HTTP layer for /api/contacts and /api/countries/:code/contacts.
import * as svc from "../services/contactService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// GET /api/contacts?country=US  OR  GET /api/countries/US/contacts
export const get = asyncHandler(async (req, res) => {
    const country = (req.params.code ?? req.query.country)?.toUpperCase() ?? null;
    res.json(await svc.getContacts(country));
});

// PUT /api/contacts?country=US  OR  PUT /api/countries/US/contacts
export const update = asyncHandler(async (req, res) => {
    const country = (req.params.code ?? req.query.country)?.toUpperCase() ?? "default";
    res.json(await svc.updateContacts(country, req.body));
});
