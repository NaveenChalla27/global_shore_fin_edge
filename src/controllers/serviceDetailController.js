import * as svc from "../services/serviceDetailService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (_req, res) => {
    res.json({categories: await svc.listCategories()});
});

export const getCategory = asyncHandler(async (req, res) => {
    res.json(await svc.getCategory(req.params.slug));
});

export const getService = asyncHandler(async (req, res) => {
    res.json(await svc.getService(req.params.slug));
});
