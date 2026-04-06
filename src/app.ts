import express, { type Express } from "express";
import healthRouter from "./routes/health.js";
import publisherRouter from "./routes/publishers.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Routes
  app.use(healthRouter);
  app.use(publisherRouter);

  return app;
}
