// Last-resort error handler. Plays nicely with HttpError + OpenAPI validator errors.
export function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    // Re-stamp CORS headers — if an error is thrown before the route handler
    // the CORS middleware headers may not have been flushed yet.
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.status(status).json({
        error: err.message || "Internal error",
        details: err.errors,
    });
}
