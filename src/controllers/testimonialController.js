import * as svc from "../services/testimonialService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// GET /api/testimonials?country=US  OR  GET /api/countries/US/testimonials
export const list = asyncHandler(async (req, res) => {
    const country = (req.params.code ?? req.query.country)?.toUpperCase() ?? null;
    res.json({testimonials: await svc.listTestimonials(country)});
});

export const getOne = asyncHandler(async (req, res) => {
    res.json(await svc.getTestimonial(req.params.id));
});

// POST /api/testimonials  OR  POST /api/countries/US/testimonials
export const create = asyncHandler(async (req, res) => {
    const country = req.params.code?.toUpperCase() ?? req.body.country ?? null;
    res.status(201).json(await svc.createTestimonial({...req.body, country}));
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updateTestimonial(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
    await svc.removeTestimonial(req.params.id);
    res.status(204).end();
});
