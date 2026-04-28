import {readJson, writeJson} from "../store/jsonStore.js";
import {POSTS_FILE} from "../config/paths.js";
import {HttpError} from "../utils/HttpError.js";

async function readAll() {
    const data = await readJson(POSTS_FILE, {posts: []});
    return Array.isArray(data.posts) ? data.posts : [];
}

async function writeAll(posts) {
    await writeJson(POSTS_FILE, {posts});
}

export async function listPosts() {
    const posts = await readAll();
    return [...posts].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getPost(slug) {
    const posts = await readAll();
    const post = posts.find((p) => p.slug === slug);
    if (!post) throw new HttpError(404, `Post '${slug}' not found`);
    return post;
}

export async function createPost(input) {
    const posts = await readAll();
    if (posts.some((p) => p.slug === input.slug)) {
        throw new HttpError(409, `Post '${input.slug}' already exists`);
    }
    const post = {
        slug: input.slug,
        tag: input.tag,
        title: input.title,
        excerpt: input.excerpt ?? "",
        thumb: input.thumb ?? "thumb",
        publishedAt: input.publishedAt ?? new Date().toISOString().slice(0, 10),
        body: input.body ?? "",
    };
    posts.push(post);
    await writeAll(posts);
    return post;
}

export async function updatePost(slug, patch) {
    const posts = await readAll();
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) throw new HttpError(404, `Post '${slug}' not found`);
    posts[idx] = {...posts[idx], ...patch, slug: posts[idx].slug};
    await writeAll(posts);
    return posts[idx];
}

export async function removePost(slug) {
    const posts = await readAll();
    const next = posts.filter((p) => p.slug !== slug);
    if (next.length === posts.length) throw new HttpError(404, `Post '${slug}' not found`);
    await writeAll(next);
}
