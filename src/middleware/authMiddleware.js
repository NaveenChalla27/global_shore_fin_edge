// Express middleware that validates the httpOnly JWT cookie on protected routes.
import jwt from "jsonwebtoken";
import {HttpError} from "../utils/HttpError.js";

const JWT_SECRET  = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: JWT_SECRET");
}
const COOKIE_NAME = "gsf_auth";

export function requireAuth(req, _res, next) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        return next(new HttpError(401, "Missing authorization token"));
    }
    try {
        req.admin = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        next(new HttpError(401, "Invalid or expired token"));
    }
}
