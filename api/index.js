// /api/index.js
import { createApp } from "../src/app.js";

let app;

export default function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}