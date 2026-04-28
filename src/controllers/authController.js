// POST /api/auth/login  � validate credentials, set httpOnly cookie with signed JWT.
// GET  /api/auth/me     � verify cookie, return username (used to restore session on page load).
// POST /api/auth/logout � clear the auth cookie.
import {timingSafeEqual} from "node:crypto";
import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/asyncHandler.js";
import {HttpError} from "../utils/HttpError.js";

const isProd = process.env.NODE_ENV === "production";

function requireEnv(name) {
    const val = process.env[name];
    if (!val && isProd) throw new Error(`Missing required environment variable: ${name}`);
    return val;
}

const ADMIN_USER  = requireEnv("ADMIN_USER")  ?? "admin";
const ADMIN_PASS  = requireEnv("ADMIN_PASS");
const JWT_SECRET  = requireEnv("JWT_SECRET");
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "8h";
const COOKIE_NAME = "gsf_auth";
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 h in ms



const cookieOpts = {
    httpOnly: true,       // JS cannot read the token � XSS safe
    secure:   isProd,     // HTTPS only in production
    sameSite: "strict",   // CSRF protection
    path:     "/api",     // only sent on /api requests
    maxAge:   COOKIE_MAX_AGE,
};

/** Constant-time string comparison to prevent timing attacks. */
function safeEqual(a, b) {
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    if (ba.length !== bb.length) {
        timingSafeEqual(ba, ba);
        return false;
    }
    return timingSafeEqual(ba, bb);
}

export const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body ?? {};
    if (!safeEqual(username ?? "", ADMIN_USER) || !safeEqual(password ?? "", ADMIN_PASS)) {
        throw new HttpError(401, "Invalid credentials");
    }
    const token = jwt.sign({sub: ADMIN_USER, role: "admin"}, JWT_SECRET, {expiresIn: JWT_EXPIRES});
    res.cookie(COOKIE_NAME, token, cookieOpts);
    res.json({ok: true});
});

export const me = asyncHandler(async (req, res) => {
    // requireAuth middleware has already verified the cookie and set req.admin
    res.json({username: req.admin.sub});
});

export const logout = asyncHandler(async (_req, res) => {
    res.clearCookie(COOKIE_NAME, {...cookieOpts, maxAge: undefined});
    res.json({ok: true});
});
