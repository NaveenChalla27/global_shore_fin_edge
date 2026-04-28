// Last-resort error handler. Plays nicely with HttpError + OpenAPI validator errors.
export function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || "Internal error",
        details: err.errors,
    });
}
