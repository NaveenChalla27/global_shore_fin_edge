import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import * as OpenApiValidator from "express-openapi-validator";
import { readFileSync } from "node:fs";
import { SPEC_FILE } from "./config/paths.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const isProd = process.env.NODE_ENV === "production";

// ENV: ALLOWED_ORIGINS=https://your-domain.com
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function createApp() {
  const apiSpec = yaml.load(readFileSync(SPEC_FILE, "utf8"));

  const app = express();


  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(compression());
  app.use(morgan(isProd ? "combined" : "dev"));

  // CORS — must run before every other middleware so all responses carry the header
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : null;
    if (origin && (!allowed || allowed.includes(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (!origin) {
      // server-to-server / curl — no header needed
    } else {
      res.setHeader("Access-Control-Allow-Origin", ""); // blocked
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
  });

  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  // Swagger + OpenAPI
  if (!isProd || process.env.EXPOSE_DOCS === "true") {
    app.get("/openapi.yaml", (_req, res) =>
      res.type("text/yaml").sendFile(SPEC_FILE)
    );

    app.get("/openapi.json", (_req, res) => res.json(apiSpec));

    app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(apiSpec, {
        customSiteTitle: "Edge Service Docs",
        swaggerOptions: {
          url: "/openapi.json",
          withCredentials: true,
        },
      })
    );
  }

  // Root health
  app.get("/", (_req, res) => {
    res.json({
      service: "edge-service",
      status: "ok",
      docs:
        isProd && process.env.EXPOSE_DOCS !== "true"
          ? null
          : "/docs",
      health: "/api/health",
    });
  });

  // OpenAPI validation
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests: true,
      validateResponses: false,
    })
  );

  // API routes
  app.use("/api", apiRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}