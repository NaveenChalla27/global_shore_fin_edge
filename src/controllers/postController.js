// HTTP layer for /api/posts.
import * as svc from "../services/postService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// GET /api/posts?country=US  OR  GET /api/countries/US/posts
export const list = asyncHandler(async (req, res) => {
    const country = (req.params.code ?? req.query.country)?.toUpperCase() ?? null;
    res.json({posts: await svc.listPosts(country)});
});

export const getOne = asyncHandler(async (req, res) => {
    res.json(await svc.getPost(req.params.slug));
});

// POST /api/posts  OR  POST /api/countries/US/posts  (country injected from route)
export const create = asyncHandler(async (req, res) => {
    const country = req.params.code?.toUpperCase() ?? req.body.country ?? null;
    res.status(201).json(await svc.createPost({...req.body, country}));
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updatePost(req.params.slug, req.body));
});

export const remove = asyncHandler(async (req, res) => {
    await svc.removePost(req.params.slug);
    res.status(204).end();
});
