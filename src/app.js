import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import * as OpenApiValidator from "express-openapi-validator";
import {readFileSync} from "node:fs";
import {SPEC_FILE} from "./config/paths.js";
import apiRouter from "./routes/index.js";
import {errorHandler} from "./middleware/errorHandler.js";

const isProd = process.env.NODE_ENV === "production";

// Comma-separated list, e.g.
//   ALLOWED_ORIGINS=https://globalshorefinservices.com,https://www.globalshorefinservices.com
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsOptions = isProd
    ? {
          origin: (origin, cb) => {
              // Allow same-origin / curl / server-to-server (no Origin header)
              if (!origin) return cb(null, true);
              if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
              return cb(new Error(`Origin ${origin} not allowed by CORS`));
          },
          credentials: true,
      }
    : {origin: true};

export function createApp() {
    const apiSpec = yaml.load(readFileSync(SPEC_FILE, "utf8"));

    const app = express();

    // Behind nginx / Hostinger proxy: trust X-Forwarded-* headers
    app.set("trust proxy", 1);

    app.use(
        helmet({
            // Swagger UI loads inline scripts/styles, so relax CSP only on /docs
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        }),
    );
    app.use(compression());
    app.use(morgan(isProd ? "combined" : "dev"));
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json({limit: "1mb"}));

    // Spec + interactive docs (disabled in prod by default; set EXPOSE_DOCS=true to enable)
    if (!isProd || process.env.EXPOSE_DOCS === "true") {
        app.get("/openapi.yaml", (_req, res) => res.type("text/yaml").sendFile(SPEC_FILE));
        app.get("/openapi.json", (_req, res) => res.json(apiSpec));
        app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSpec, {customSiteTitle: "Edge Service Docs"}));
    }

    // Spec-driven request/response validation
    app.use(
        OpenApiValidator.middleware({
            apiSpec,
            validateRequests: true,
            validateResponses: !isProd,
        }),
    );

    // Routes
    app.use("/api", apiRouter);

    // Errors last
    app.use(errorHandler);

    return app;
}
