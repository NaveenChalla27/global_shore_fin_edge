// HTTP layer for /api/contacts.
import * as svc from "../services/contactService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const get = asyncHandler(async (_req, res) => {
    res.json(await svc.getContacts());
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updateContacts(req.body));
});
