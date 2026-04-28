// HTTP layer for /api/posts.
import * as svc from "../services/postService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const list = asyncHandler(async (_req, res) => {
    res.json({posts: await svc.listPosts()});
});

export const getOne = asyncHandler(async (req, res) => {
    res.json(await svc.getPost(req.params.slug));
});

export const create = asyncHandler(async (req, res) => {
    res.status(201).json(await svc.createPost(req.body));
});

export const update = asyncHandler(async (req, res) => {
    res.json(await svc.updatePost(req.params.slug, req.body));
});

export const remove = asyncHandler(async (req, res) => {
    await svc.removePost(req.params.slug);
    res.status(204).end();
});
