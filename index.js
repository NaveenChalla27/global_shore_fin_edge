// Bootstrap. Exports the app for Vercel serverless; also starts a local server.
import {createApp} from "./src/app.js";
import {PORT} from "./src/config/paths.js";

const app = createApp();

// Vercel sets VERCEL=1 automatically — skip listen() in that environment.
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`[edge-service] listening on http://localhost:${PORT}`);
        console.log(`[edge-service] docs:       http://localhost:${PORT}/docs`);
    });
}

export default app;
