import express, { type Express } from "express";
import healthRouter from "./routes/health.js";
import publisherRouter from "./routes/publishers.js";
import resourceRouter from "./routes/resources.js";
import verifyRouter from "./routes/verify.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Routes
  app.use(healthRouter);
  app.use(publisherRouter);
  app.use(resourceRouter);
  app.use(verifyRouter);

  return app;
}
