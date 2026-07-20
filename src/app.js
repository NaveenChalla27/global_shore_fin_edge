import express from "express";
import cors from "cors";
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

// ENV: ALLOWED_ORIGINS=https://your-domain.com,https://other-domain.com
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ?? "http://www.globalshorefinservices.com,https://www.globalshorefinservices.com,https://global-shore-fin-edge.vercel.app,http://localhost:4000,http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function createApp() {
  const apiSpec = yaml.load(readFileSync(SPEC_FILE, "utf8"));

  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(compression());
  app.use(morgan(isProd ? "combined" : "dev"));


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

  // Prevent CDN and browser caching on all API responses
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  // API routes
  app.use("/api", apiRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}