import * as svc from "../services/testimonialService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const list = asyncHandler(async (_req, res) => {
    res.json({testimonials: await svc.listTestimonials()});
});

export const getOne = asyncHandler(async (req, res) => {
    res.json(await svc.getTestimonial(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
    res.status(201).json(await svc.createTestimonial(req.body));
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updateTestimonial(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
    await svc.removeTestimonial(req.params.id);
    res.status(204).end();
});
