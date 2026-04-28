// HTTP layer for /api/countries — translates requests to service calls.
import * as svc from "../services/countryService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const list = asyncHandler(async (_req, res) => {
    res.json(await svc.listCountries());
});

export const getOne = asyncHandler(async (req, res) => {
    res.json(await svc.getCountry(req.params.code));
});

export const create = asyncHandler(async (req, res) => {
    const created = await svc.createCountry(req.body);
    res.status(201).json(created);
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updateCountry(req.params.code, req.body));
});

export const remove = asyncHandler(async (req, res) => {
    await svc.deleteCountry(req.params.code);
    res.status(204).end();
});

export const addService = asyncHandler(async (req, res) => {
    const created = await svc.addService(req.params.code, req.body);
    res.status(201).json(created);
});

export const updateService = asyncHandler(async (req, res) => {
    res.json(await svc.updateService(req.params.code, req.params.key, req.body));
});

export const removeService = asyncHandler(async (req, res) => {
    await svc.deleteService(req.params.code, req.params.key);
    res.status(204).end();
});
